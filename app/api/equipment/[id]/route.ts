import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Equipment } from "@/models/Equipment";
import { connectDB } from "@/lib/mongodb";
import { apiError, unauthorized, notFound, newRequestId } from "@/lib/db-helpers";

const VALID_STATUSES = ["planning", "ordered", "delivered", "installed", "integrated"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = newRequestId();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const body = await request.json();
    const { name, category, capex, maintenanceCost, status, deliveryDate } = body;

    if (status && !VALID_STATUSES.includes(status)) {
      return apiError(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        { status: 400, requestId }
      );
    }

    await connectDB();

    const equipment = await Equipment.findOneAndUpdate(
      { _id: params.id, organizationId: session.user.organizationId },
      {
        $set: {
          ...(name && { name }),
          ...(category && { category }),
          ...(capex !== undefined && { capex }),
          ...(maintenanceCost !== undefined && { maintenanceCost }),
          ...(status && { status }),
          ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
          updatedBy: session.user.id ?? null,
          requestId,
        },
      },
      { new: true, runValidators: true, context: "query" }
    );

    if (!equipment) return notFound("Equipment not found", requestId);

    return NextResponse.json({ data: equipment, requestId });
  } catch (error) {
    console.error("[PATCH /api/equipment/:id]", error);
    return apiError("Failed to update equipment", { status: 500, requestId, detail: error });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = newRequestId();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    await connectDB();

    const equipment = await Equipment.findOneAndDelete({
      _id: params.id,
      organizationId: session.user.organizationId,
    });

    if (!equipment) return notFound("Equipment not found", requestId);

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    console.error("[DELETE /api/equipment/:id]", error);
    return apiError("Failed to delete equipment", { status: 500, requestId, detail: error });
  }
}
