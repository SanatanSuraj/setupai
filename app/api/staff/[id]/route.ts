import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Staff } from "@/models/Staff";
import { newRequestId } from "@/lib/db-helpers";

const ALLOWED_ROLES = ["pathologist", "technician", "phlebotomist", "receptionist", "manager"] as const;
const ALLOWED_TRAINING = ["pending", "in-progress", "certified", "expired"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = newRequestId();
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const update: Record<string, unknown> = {
      updatedBy: session.user.id ?? null,
      requestId,
    };

    if (typeof body?.name === "string") update.name = body.name;
    if (typeof body?.qualification === "string") update.qualification = body.qualification;
    if (typeof body?.salary === "number") update.salary = body.salary;
    if (typeof body?.isMandatory === "boolean") update.isMandatory = body.isMandatory;
    if (body?.joinedDate) update.joinedDate = new Date(body.joinedDate);
    if (Array.isArray(body?.trainingModules)) update.trainingModules = body.trainingModules;

    if (body?.role) {
      if (!ALLOWED_ROLES.includes(body.role)) {
        return NextResponse.json({ error: "Invalid role", requestId }, { status: 400 });
      }
      update.role = body.role;
    }
    if (body?.trainingStatus) {
      if (!ALLOWED_TRAINING.includes(body.trainingStatus)) {
        return NextResponse.json({ error: "Invalid trainingStatus", requestId }, { status: 400 });
      }
      update.trainingStatus = body.trainingStatus;
    }

    await connectDB();
    const doc = await Staff.findOneAndUpdate(
      { _id: id, organizationId: session.user.organizationId },
      { $set: update },
      { new: true, runValidators: true, context: "query" }
    ).lean();

    if (!doc) return NextResponse.json({ error: "Not found", requestId }, { status: 404 });
    return NextResponse.json({ data: doc, requestId });
  } catch (e) {
    console.error("[PATCH /api/staff/:id]", e);
    return NextResponse.json({ error: "Failed to update staff", requestId }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = newRequestId();
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
  }
  const { id } = await params;
  try {
    await connectDB();
    const res = await Staff.deleteOne({ _id: id, organizationId: session.user.organizationId });
    if (!res.deletedCount) return NextResponse.json({ error: "Not found", requestId }, { status: 404 });
    return NextResponse.json({ ok: true, requestId });
  } catch (e) {
    console.error("[DELETE /api/staff/:id]", e);
    return NextResponse.json({ error: "Failed to delete staff", requestId }, { status: 500 });
  }
}

