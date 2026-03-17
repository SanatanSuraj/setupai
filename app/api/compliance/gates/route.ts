import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ComplianceGate } from "@/models/ComplianceGate";
import { StateRegulatoryProfile } from "@/models/StateRegulatoryProfile";
import connectDB from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Get all compliance gates with state-specific rules
    const gates = await ComplianceGate.find({ 
      organizationId: session.user.organizationId 
    }).sort({ createdAt: 1 });
    
    return NextResponse.json(gates);
  } catch (error) {
    console.error("Error fetching compliance gates:", error);
    return NextResponse.json(
      { error: "Failed to fetch compliance gates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gateType, documents, applicationDetails, stateSpecificRules } = body;

    await connectDB();

    // Create or update compliance gate
    const gate = await ComplianceGate.findOneAndUpdate(
      { 
        organizationId: session.user.organizationId, 
        gateType 
      },
      {
        organizationId: session.user.organizationId,
        gateType,
        status: 'in_progress',
        documents: documents || [],
        applicationDetails: applicationDetails || {},
        stateSpecificRules: stateSpecificRules || {},
        lastUpdated: new Date()
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    return NextResponse.json(gate);
  } catch (error) {
    console.error("Error creating/updating compliance gate:", error);
    return NextResponse.json(
      { error: "Failed to create/update compliance gate" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { gateType, status, documents, applicationDetails } = body;

    await connectDB();

    const gate = await ComplianceGate.findOneAndUpdate(
      { 
        organizationId: session.user.organizationId, 
        gateType 
      },
      {
        $set: {
          status,
          ...(documents && { documents }),
          ...(applicationDetails && { applicationDetails }),
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    if (!gate) {
      return NextResponse.json(
        { error: "Compliance gate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(gate);
  } catch (error) {
    console.error("Error updating compliance gate:", error);
    return NextResponse.json(
      { error: "Failed to update compliance gate" },
      { status: 500 }
    );
  }
}