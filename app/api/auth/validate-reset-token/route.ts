import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { PasswordResetToken } from "@/models/PasswordResetToken";

/** GET ?token=xxx — returns { valid: boolean } without revealing details */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token || token.length < 10) {
    return NextResponse.json({ valid: false });
  }

  try {
    await connectDB();
    const tokens = await PasswordResetToken.find({
      expiresAt: { $gt: new Date() },
    }).lean();

    for (const t of tokens) {
      const ok = await bcrypt.compare(token, t.tokenHash);
      if (ok) return NextResponse.json({ valid: true });
    }
    return NextResponse.json({ valid: false });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
