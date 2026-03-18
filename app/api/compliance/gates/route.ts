import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ComplianceGate } from "@/models/ComplianceGate";
import { GoLiveGate } from "@/models/GoLiveGate";
import { connectDB } from "@/lib/mongodb";
import { newRequestId, apiError, unauthorized } from "@/lib/db-helpers";

export async function GET(request: NextRequest) {
  const requestId = newRequestId();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    await connectDB();

    const gates = await ComplianceGate.find({
      organizationId: session.user.organizationId,
    }).sort({ createdAt: 1 });

    return NextResponse.json({ data: gates, requestId });
  } catch (error) {
    console.error("[GET /api/compliance/gates]", error);
    return apiError("Failed to fetch compliance gates", { status: 500, requestId, detail: error });
  }
}

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const body = await request.json().catch(() => null);
    if (!body) return apiError("Invalid JSON body", { status: 400, requestId });

    const { gateType, documents, applicationDetails, stateSpecificRules } = body;
    if (!gateType) return apiError("gateType is required", { status: 400, requestId });

    await connectDB();

    const gate = await ComplianceGate.findOneAndUpdate(
      { organizationId: session.user.organizationId, gateType },
      {
        $set: {
          organizationId: session.user.organizationId,
          gateType,
          status: "in_progress",
          documents: documents ?? [],
          applicationDetails: applicationDetails ?? {},
          stateSpecificRules: stateSpecificRules ?? {},
          lastUpdated: new Date(),
          updatedBy: session.user.id ?? null,
          requestId,
        },
      },
      { upsert: true, new: true, runValidators: true, context: "query" }
    );

    return NextResponse.json({ data: gate, requestId });
  } catch (error) {
    console.error("[POST /api/compliance/gates]", error);
    return apiError("Failed to create/update compliance gate", { status: 500, requestId, detail: error });
  }
}

export async function PATCH(request: NextRequest) {
  const requestId = newRequestId();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const body = await request.json().catch(() => null);
    if (!body) return apiError("Invalid JSON body", { status: 400, requestId });

    const { gateType, status, documents, applicationDetails, gateCategory } = body;
    if (!gateType) return apiError("gateType is required", { status: 400, requestId });

    await connectDB();

    // Route to GoLiveGate when gateCategory === "golive"
    if (gateCategory === "golive") {
      const gate = await GoLiveGate.findOneAndUpdate(
        { organizationId: session.user.organizationId, gateType },
        {
          $set: {
            status,
            ...(documents && { documents }),
            updatedBy: session.user.id ?? null,
            requestId,
          },
        },
        { new: true, runValidators: true, context: "query" }
      );

      if (!gate) return apiError("Go-live gate not found", { status: 404, requestId });
      return NextResponse.json({ data: gate, requestId });
    }

    // Default: ComplianceGate
    const gate = await ComplianceGate.findOneAndUpdate(
      { organizationId: session.user.organizationId, gateType },
      {
        $set: {
          status,
          ...(documents && { documents }),
          ...(applicationDetails && { applicationDetails }),
          lastUpdated: new Date(),
          updatedBy: session.user.id ?? null,
          requestId,
        },
      },
      { new: true, runValidators: true, context: "query" }
    );

    if (!gate) return apiError("Compliance gate not found", { status: 404, requestId });
    return NextResponse.json({ data: gate, requestId });
  } catch (error) {
    console.error("[PATCH /api/compliance/gates]", error);
    return apiError("Failed to update compliance gate", { status: 500, requestId, detail: error });
  }
}