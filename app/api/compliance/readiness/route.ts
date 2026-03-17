import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ComplianceGate } from "@/models/ComplianceGate";
import { GoLiveGate } from "@/models/GoLiveGate";
import { StateRegulatoryProfile } from "@/models/StateRegulatoryProfile";
import connectDB from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Check go-live readiness using both models
    const complianceReadiness = await ComplianceGate.checkGoLiveReadiness(
      session.user.organizationId
    );
    
    const goLiveReadiness = await GoLiveGate.checkGoLiveReadiness(
      session.user.organizationId
    );
    
    // Get all gates for detailed status
    const complianceGates = await ComplianceGate.find({ 
      organizationId: session.user.organizationId 
    }).sort({ createdAt: 1 });
    
    const goLiveGates = await GoLiveGate.find({ 
      organizationId: session.user.organizationId 
    }).sort({ createdAt: 1 });
    
    // Calculate overall readiness
    const totalGates = complianceGates.length + goLiveGates.length;
    const passedGates = complianceGates.filter(g => g.status === 'approved').length + 
                      goLiveGates.filter(g => g.status === 'passed').length;
    
    const overallCompletion = totalGates > 0 ? (passedGates / totalGates) * 100 : 0;
    
    // Check for critical blockers
    const criticalBlockers = [
      ...complianceGates.filter(g => g.hardGate && !g.canProceed()),
      ...goLiveGates.filter(g => g.isHardGate && !g.canProceed())
    ];
    
    // BMW-specific status
    const bmwGate = complianceGates.find(g => g.gateType === 'bmw_authorization');
    const bmwStatus = {
      exists: !!bmwGate,
      status: bmwGate?.status || 'not_started',
      canProceed: bmwGate?.canProceed() || false,
      isExpired: bmwGate?.isExpired() || false,
      isRenewalDue: bmwGate?.isRenewalDue() || false,
      expiryDate: bmwGate?.applicationDetails?.expiryDate,
      renewalDue: bmwGate?.applicationDetails?.renewalDue
    };
    
    return NextResponse.json({
      canGoLive: criticalBlockers.length === 0,
      overallCompletion,
      totalGates,
      passedGates,
      criticalBlockers: criticalBlockers.length,
      complianceReadiness,
      goLiveReadiness,
      bmwStatus,
      gates: {
        compliance: complianceGates,
        goLive: goLiveGates
      },
      blockers: criticalBlockers.map(gate => ({
        name: gate.name,
        type: gate.gateType || 'unknown',
        reason: gate.blockingReason,
        actionRequired: gate.actionRequired
      }))
    });
  } catch (error) {
    console.error("Error checking go-live readiness:", error);
    return NextResponse.json(
      { error: "Failed to check go-live readiness" },
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
    const { state, labType, district } = body;

    await connectDB();
    
    // Initialize compliance gates based on state regulatory profile
    const stateProfile = await StateRegulatoryProfile.getByState(state);
    if (!stateProfile) {
      return NextResponse.json(
        { error: `State regulatory profile not found for ${state}` },
        { status: 404 }
      );
    }
    
    // Get required licenses for this state and lab type
    const requiredLicenses = await StateRegulatoryProfile.getRequiredLicenses(state, labType);
    
    // Initialize compliance gates
    await ComplianceGate.initializeStateGates(session.user.organizationId, state);
    
    // Initialize go-live gates
    await GoLiveGate.initializeDefaultGates(session.user.organizationId);
    
    // Get district-specific rules if provided
    const districtRules = district ? stateProfile.getDistrictRules(district) : null;
    
    // Get CBWTF vendors for the district
    const cbwtfVendors = district ? stateProfile.getCBWTFVendors(district) : stateProfile.cbwtfVendors;
    
    // Calculate estimated timeline
    const estimatedTimeline = stateProfile.getEstimatedTimeline(labType, district || '');
    
    return NextResponse.json({
      success: true,
      message: 'Compliance gates initialized successfully',
      stateProfile: {
        state: stateProfile.state,
        requiredLicenses,
        districtRules,
        cbwtfVendors,
        estimatedTimeline
      }
    });
  } catch (error) {
    console.error("Error initializing compliance gates:", error);
    return NextResponse.json(
      { error: "Failed to initialize compliance gates" },
      { status: 500 }
    );
  }
}