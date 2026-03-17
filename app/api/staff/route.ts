import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Staff } from "@/models/Staff";

const ALLOWED_ROLES = ["pathologist", "technician", "phlebotomist", "receptionist", "manager"] as const;
const ALLOWED_TRAINING = ["pending", "in-progress", "certified", "expired"] as const;

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
    const {
      name,
      role,
      qualification,
      salary,
      trainingStatus,
      trainingModules,
      joinedDate,
      isMandatory,
    } = body ?? {};

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!role || !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (trainingStatus && !ALLOWED_TRAINING.includes(trainingStatus)) {
      return NextResponse.json({ error: "Invalid trainingStatus" }, { status: 400 });
    }
    await connectDB();
    const staff = await Staff.create({
      organizationId: session.user.organizationId,
      name,
      role,
      qualification: qualification ?? "",
      salary: typeof salary === "number" ? salary : 0,
      trainingStatus: trainingStatus ?? "pending",
      trainingModules: Array.isArray(trainingModules) ? trainingModules : [],
      joinedDate: joinedDate ? new Date(joinedDate) : new Date(),
      isMandatory: typeof isMandatory === "boolean" ? isMandatory : false,
    });
    return NextResponse.json(staff);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add staff" }, { status: 500 });
  }
}
