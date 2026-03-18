import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { License } from "@/models/License";
import { newRequestId } from "@/lib/db-helpers";

const ALLOWED_STATUSES = ["pending", "submitted", "approved", "rejected", "expired"];

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
    const { status } = body;
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status", requestId }, { status: 400 });
    }
    await connectDB();
    const license = await License.findOneAndUpdate(
      { _id: id, organizationId: session.user.organizationId },
      { $set: { status, updatedBy: session.user.id ?? null, requestId } },
      { new: true, runValidators: true, context: "query" }
    );
    if (!license) {
      return NextResponse.json({ error: "License not found", requestId }, { status: 404 });
    }
    return NextResponse.json({ data: license, requestId });
  } catch (e) {
    console.error("[PATCH /api/licenses/:id]", e);
    return NextResponse.json({ error: "Failed to update license", requestId }, { status: 500 });
  }
}
