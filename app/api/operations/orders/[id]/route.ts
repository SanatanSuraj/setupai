import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { SampleOrder } from "@/models/SampleOrder";
import { newRequestId } from "@/lib/db-helpers";

const ALLOWED_STATUSES = ["collected", "testing", "qc", "report_generated", "delivered"] as const;
type OrderStatus = (typeof ALLOWED_STATUSES)[number];

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
    const body = await req.json().catch(() => ({}));
    const { status } = body as { status?: string };
    if (!status) {
      return NextResponse.json({ error: "status required", requestId }, { status: 400 });
    }
    if (!ALLOWED_STATUSES.includes(status as OrderStatus)) {
      return NextResponse.json(
        { error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`, requestId },
        { status: 400 }
      );
    }
    await connectDB();
    const order = await SampleOrder.findOneAndUpdate(
      { _id: id, organizationId: session.user.organizationId },
      { $set: { status, updatedBy: session.user.id ?? null, requestId } },
      { new: true, runValidators: true, context: "query" }
    );
    if (!order) return NextResponse.json({ error: "Not found", requestId }, { status: 404 });
    return NextResponse.json({ data: order, requestId });
  } catch (e) {
    console.error("[PATCH /api/operations/orders/:id]", e);
    return NextResponse.json({ error: "Failed to update order", requestId }, { status: 500 });
  }
}
