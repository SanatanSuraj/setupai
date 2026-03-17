import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { License } from "@/models/License";

const ALLOWED_STATUSES = ["pending", "submitted", "approved", "rejected", "expired"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await req.json();
    const { status } = body;
    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    await connectDB();
    const license = await License.findOneAndUpdate(
      { _id: id, organizationId: session.user.organizationId },
      { status },
      { new: true }
    );
    if (!license) {
      return NextResponse.json({ error: "License not found" }, { status: 404 });
    }
    return NextResponse.json(license);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update license" }, { status: 500 });
  }
}
