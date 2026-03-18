import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { aiOrchestrator } from "@/lib/ai-orchestrator";
import { Organization } from "@/models/Organization";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { labType, city, state, district, budget } = body;

    if (!labType || !city) {
      return NextResponse.json(
        { error: "Lab type and city are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get organization details for context
    const organization = await Organization.findById(session.user.organizationId);
    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Generate AI-powered roadmap
    const roadmap = await aiOrchestrator.generateRoadmap({
      labType,
      city,
      state: state || organization.state,
      district: district || organization.district,
      budget: budget || 1000000
    });

    return NextResponse.json({
      success: true,
      roadmap,
      generatedAt: new Date().toISOString(),
      aiPowered: true
    });
  } catch (error) {
    console.error("Error generating AI roadmap:", error);
    return NextResponse.json(
      { error: "Failed to generate roadmap" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const organizationId = session.user.organizationId;

    await connectDB();

    // Generate compliance insights
    const insights = await aiOrchestrator.generateComplianceInsight(organizationId);

    return NextResponse.json({
      success: true,
      insights,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error generating compliance insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}