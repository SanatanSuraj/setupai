import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { checkRateLimit, recordRequest } from "@/lib/rate-limit";
import { newRequestId } from "@/lib/db-helpers";
import { z } from "zod";

/** Token expiry: 15 minutes */
const TOKEN_EXPIRY_MS = 15 * 60 * 1000;

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const requestId = newRequestId();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? req.headers.get("x-real-ip")
    ?? "unknown";

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address", requestId },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Rate limiting: 3 requests per 15 min per IP and per email
    const limit = checkRateLimit(ip, email);
    if (!limit.ok) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: limit.retryAfter,
          requestId,
        },
        { status: 429, headers: limit.retryAfter ? { "Retry-After": String(limit.retryAfter) } : undefined }
      );
    }
    recordRequest(ip, email);
    await connectDB();

    const user = await User.findOne({ email }).lean();
    if (!user) {
      // Don't reveal whether email exists; always return success
      return NextResponse.json({
        message: "If an account exists for this email, you will receive a password reset link.",
        requestId,
      });
    }

    // Delete any existing tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = await bcrypt.hash(rawToken, 10);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS);

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (mailErr) {
      console.error("Failed to send password reset email:", mailErr);
      await PasswordResetToken.deleteMany({ userId: user._id });
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again later.", requestId },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "If an account exists for this email, you will receive a password reset link.",
      requestId,
    });
  } catch (e) {
    console.error("Forgot password error:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later.", requestId },
      { status: 500 }
    );
  }
}
