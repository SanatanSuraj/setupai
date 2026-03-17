import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { aiOrchestrator } from "@/lib/ai-orchestrator";
import { Organization } from "@/models/Organization";
import connectDB from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { testMenu, budget, labType } = body;

    if (!testMenu || !Array.isArray(testMenu)) {
      return NextResponse.json(
        { error: "Test menu array is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get organization details
    const organization = await Organization.findById(session.user.organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Generate AI-powered equipment recommendations
    const recommendations = await aiOrchestrator.recommendEquipment(
      testMenu,
      budget || 1000000,
      labType || 'basic',
      organization.state || 'Maharashtra'
    );

    return NextResponse.json({
      success: true,
      recommendations,
      generatedAt: new Date().toISOString(),
      aiPowered: true,
      context: {
        testMenu,
        budget,
        labType,
        state: organization.state
      }
    });
  } catch (error) {
    console.error("Error generating equipment recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate equipment recommendations" },
      { status: 500 }
    );
  }
}