import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { aiOrchestrator } from "@/lib/ai-orchestrator";
import { Organization } from "@/models/Organization";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const body = await req.json();
    const testMenu = Array.isArray(body.testMenu) ? body.testMenu : body.testMenu ? [body.testMenu] : ["CBC", "Sugar", "Creatinine"];
    const budget = body.budget || 1000000;
    const labType = body.labType || 'basic';

    await connectDB();

    // Get organization details for state context
    const organization = await Organization.findById(session.user.organizationId);
    const state = organization?.state || 'Maharashtra';

    // Use AI orchestrator for enhanced recommendations
    const recommendations = await aiOrchestrator.recommendEquipment(
      testMenu,
      budget,
      labType,
      state
    );

    return NextResponse.json({
      recommendations,
      aiPowered: true,
      context: { testMenu, budget, labType, state }
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}
