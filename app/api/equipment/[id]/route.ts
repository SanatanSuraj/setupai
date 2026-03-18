import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Equipment } from "@/models/Equipment";
import { connectDB } from "@/lib/mongodb";

const VALID_STATUSES = ["planning", "ordered", "delivered", "installed", "integrated"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, category, capex, maintenanceCost, status, deliveryDate } = body;

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
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
        },
      },
      { new: true }
    );

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      { error: "Failed to update equipment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const equipment = await Equipment.findOneAndDelete({
      _id: params.id,
      organizationId: session.user.organizationId,
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return NextResponse.json(
      { error: "Failed to delete equipment" },
      { status: 500 }
    );
  }
}
