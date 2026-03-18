import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { aiOrchestrator } from "@/lib/ai-orchestrator";
import { StateRegulatoryProfile } from "@/models/StateRegulatoryProfile";
import { Organization } from "@/models/Organization";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const documentType = formData.get('documentType') as string;
    const file = formData.get('document') as File;
    const state = formData.get('state') as string;
    const district = formData.get('district') as string;

    if (!documentType || !file) {
      return NextResponse.json(
        { error: "Document type and file are required" },
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

    // Get state regulatory profile
    const stateProfile = await StateRegulatoryProfile.getByState(
      state || organization.state || 'Maharashtra'
    );

    // Convert file to buffer for AI processing
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    // Get state-specific rules
    const stateRules = stateProfile ? {
      state: stateProfile.state,
      authority: stateProfile.ceaImplementation?.authority,
      requiredDocuments: stateProfile.ceaImplementation?.requiredDocuments,
      districtRules: district ? stateProfile.getDistrictRules(district) : null
    } : null;

    // Validate document using AI
    const validationResult = await aiOrchestrator.validateComplianceDocument(
      documentType,
      fileBuffer,
      stateRules
    );

    return NextResponse.json({
      success: true,
      validation: validationResult,
      documentInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        documentType
      },
      stateContext: stateRules,
      validatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error validating document:", error);
    return NextResponse.json(
      { error: "Failed to validate document" },
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
    const licenseType = searchParams.get('licenseType');
    const state = searchParams.get('state');
    const district = searchParams.get('district');
    const documents = searchParams.get('documents')?.split(',') || [];

    if (!licenseType || !state) {
      return NextResponse.json(
        { error: "License type and state are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Perform document gap analysis
    const gapAnalysis = await aiOrchestrator.documentGapAnalysis(
      licenseType,
      documents,
      state,
      district || undefined
    );

    return NextResponse.json({
      success: true,
      gapAnalysis,
      context: {
        licenseType,
        state,
        district,
        providedDocuments: documents
      },
      analyzedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error analyzing document gaps:", error);
    return NextResponse.json(
      { error: "Failed to analyze document gaps" },
      { status: 500 }
    );
  }
}