import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(1).optional(),
  labType: z.enum(["basic", "medium", "advanced", "clinic_lab"]).optional(),
  city: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { name, email, password, organizationName, labType, city } = parsed.data;
    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });

    const org = await Organization.create({
      name: organizationName ?? `${name}'s Lab`,
      labType: labType ?? "basic",
      city: city ?? "Mumbai",
      subscriptionTier: "free",
    });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "admin",
      organizationId: org._id,
    });

    return NextResponse.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      organizationId: org._id.toString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
