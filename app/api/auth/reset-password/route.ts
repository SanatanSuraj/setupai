import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { checkResetRateLimit, recordResetAttempt } from "@/lib/rate-limit";
import { newRequestId } from "@/lib/db-helpers";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: Request) {
  const requestId = newRequestId();
  const ip = getIp(req);

  const limit = checkResetRateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      {
        error: "Too many attempts. Please try again later.",
        retryAfter: limit.retryAfter,
        requestId,
      },
      {
        status: 429,
        headers: limit.retryAfter
          ? { "Retry-After": String(limit.retryAfter) }
          : undefined,
      }
    );
  }
  recordResetAttempt(ip);

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json(
        { error: msg, requestId },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    await connectDB();

    const tokens = await PasswordResetToken.find({ expiresAt: { $gt: new Date() } }).lean();

    let matchedToken: (typeof tokens)[number] | null = null;
    for (const t of tokens) {
      const ok = await bcrypt.compare(token, t.tokenHash);
      if (ok) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one.", requestId },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.updateOne(
      { _id: matchedToken.userId },
      { $set: { password: hashedPassword } }
    );

    await PasswordResetToken.deleteOne({ _id: matchedToken._id });

    return NextResponse.json({
      message: "Password has been reset successfully. You can now sign in.",
      requestId,
    });
  } catch (e) {
    console.error("Reset password error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again.", requestId },
      { status: 500 }
    );
  }
}
