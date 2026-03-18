import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ComplianceGate } from "@/models/ComplianceGate";
import { GoLiveGate } from "@/models/GoLiveGate";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    // Get BMW compliance status
    const bmwGate = await ComplianceGate.findOne({ 
      organizationId: session.user.organizationId,
      gateType: 'bmw_authorization'
    });

    // Also check GoLiveGate for BMW status
    const goLiveBMW = await GoLiveGate.findOne({
      organizationId: session.user.organizationId,
      gateType: 'bmw_authorization'
    });
    
    return NextResponse.json({
      complianceGate: bmwGate,
      goLiveGate: goLiveBMW,
      canProceed: bmwGate?.canProceed() || false,
      isExpired: bmwGate?.isExpired() || false,
      isRenewalDue: bmwGate?.isRenewalDue() || false
    });
  } catch (error) {
    console.error("Error fetching BMW status:", error);
    return NextResponse.json(
      { error: "Failed to fetch BMW status" },
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
    const { 
      cbwtfContract, 
      authorizationDetails, 
      documents,
      applicationNumber,
      submittedDate,
      authority,
      fees
    } = body;

    await connectDB();

    // Validate CBWTF contract and update BMW status
    const bmwGate = await ComplianceGate.findOneAndUpdate(
      { 
        organizationId: session.user.organizationId, 
        gateType: 'bmw_authorization' 
      },
      { 
        organizationId: session.user.organizationId,
        gateType: 'bmw_authorization',
        status: 'in_progress',
        hardGate: true,
        enforcementActions: {
          blockPhaseProgression: true,
          blockGoLive: true,
          generateAlert: true
        },
        documents: documents || [],
        applicationDetails: {
          applicationNumber,
          submittedDate: submittedDate ? new Date(submittedDate) : new Date(),
          authority,
          fees
        },
        stateSpecificRules: {
          cbwtfContract: cbwtfContract || {}
        },
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    // Also update GoLiveGate for BMW
    await GoLiveGate.findOneAndUpdate(
      {
        organizationId: session.user.organizationId,
        gateType: 'bmw_authorization'
      },
      {
        organizationId: session.user.organizationId,
        name: 'BMW Authorization Approved',
        gateType: 'bmw_authorization',
        status: 'pending',
        isHardGate: true,
        bmwValidation: {
          authorizationStatus: 'applied',
          cbwtfContract,
          hardGateEnforcement: true
        },
        documents: documents || [],
        blockingReason: 'BMW authorization must be approved before go-live',
        actionRequired: 'Complete BMW authorization application and obtain approval from State Pollution Control Board'
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      bmwGate,
      message: 'BMW application submitted successfully'
    });
  } catch (error) {
    console.error("Error updating BMW status:", error);
    return NextResponse.json(
      { error: "Failed to update BMW status" },
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
    const { 
      status, 
      approvalDate, 
      expiryDate,
      authorizationNumber,
      documents 
    } = body;

    await connectDB();

    // Update BMW compliance gate
    const bmwGate = await ComplianceGate.findOneAndUpdate(
      { 
        organizationId: session.user.organizationId, 
        gateType: 'bmw_authorization' 
      },
      {
        $set: {
          status,
          ...(documents && { documents }),
          'applicationDetails.approvalDate': approvalDate ? new Date(approvalDate) : undefined,
          'applicationDetails.expiryDate': expiryDate ? new Date(expiryDate) : undefined,
          'applicationDetails.applicationNumber': authorizationNumber || undefined,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    // Update GoLiveGate BMW status
    const goLiveStatus = status === 'approved' ? 'passed' : 'pending';
    const authStatus = status === 'approved' ? 'approved' : 
                     status === 'expired' ? 'expired' : 'applied';

    await GoLiveGate.findOneAndUpdate(
      {
        organizationId: session.user.organizationId,
        gateType: 'bmw_authorization'
      },
      {
        $set: {
          status: goLiveStatus,
          'bmwValidation.authorizationStatus': authStatus,
          ...(documents && { documents }),
          blockingReason: status === 'approved' ? undefined : 'BMW authorization must be approved before go-live',
          actionRequired: status === 'approved' ? undefined : 'Complete BMW authorization application and obtain approval from State Pollution Control Board'
        }
      }
    );

    if (!bmwGate) {
      return NextResponse.json(
        { error: "BMW compliance gate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bmwGate,
      canProceed: bmwGate.canProceed(),
      message: status === 'approved' ? 'BMW authorization approved - Go-live gate unlocked' : 'BMW status updated'
    });
  } catch (error) {
    console.error("Error updating BMW approval status:", error);
    return NextResponse.json(
      { error: "Failed to update BMW approval status" },
      { status: 500 }
    );
  }
}