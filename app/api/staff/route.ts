import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Staff } from "@/models/Staff";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const staff = await Staff.find({ organizationId: session.user.organizationId }).lean();
  return NextResponse.json(staff);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { role, qualification, salaryBenchmark } = body;
    await connectDB();
    const staff = await Staff.create({
      organizationId: session.user.organizationId,
      role: role ?? "Lab Technician",
      qualification,
      salaryBenchmark,
    });
    return NextResponse.json(staff);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add staff" }, { status: 500 });
  }
}
