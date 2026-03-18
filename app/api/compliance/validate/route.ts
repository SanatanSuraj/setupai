import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { complianceEngine } from "@/lib/compliance-engine";
import { Organization } from "@/models/Organization";
import { Staff } from "@/models/Staff";
import { Equipment } from "@/models/Equipment";
import { connectDB } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get staff and equipment data
    const staff = await Staff.find({ organizationId: session.user.organizationId });
    const equipment = await Equipment.find({ organizationId: session.user.organizationId });

    // Build lab profile for validation
    const labProfile = {
      organizationId: session.user.organizationId,
      labType: organization.labType || 'basic',
      state: organization.state || 'Maharashtra',
      district: organization.district,
      city: organization.city || 'Mumbai',
      area: organization.area || 500,
      testMenu: organization.testMenu || ['CBC', 'Blood Sugar', 'Urine Routine'],
      staffCount: staff.length,
      pathologistQualification: staff.find(s => s.role === 'pathologist')?.qualification,
      equipment: equipment.map(eq => ({
        name: eq.name,
        category: eq.category,
        manufacturer: eq.manufacturer
      }))
    };

    // Run comprehensive compliance validation
    const complianceReport = await complianceEngine.validateLabSetup(labProfile);

    return NextResponse.json({
      success: true,
      complianceReport,
      labProfile: {
        ...labProfile,
        organizationId: undefined // Remove sensitive data
      },
      validatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error validating compliance:", error);
    return NextResponse.json(
      { error: "Failed to validate compliance" },
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

    await connectDB();

    // Check go-live readiness
    const goLiveStatus = await complianceEngine.checkGoLiveReadiness(
      session.user.organizationId
    );

    return NextResponse.json({
      success: true,
      goLiveStatus,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error checking go-live readiness:", error);
    return NextResponse.json(
      { error: "Failed to check go-live readiness" },
      { status: 500 }
    );
  }
}