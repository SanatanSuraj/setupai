import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { GoLiveGate } from "@/models/GoLiveGate";
import { ComplianceGate } from "@/models/ComplianceGate";
import { Organization } from "@/models/Organization";
import connectDB from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const organizationId = session.user.organizationId;

    // Get NABL-related gates
    const nablGates = await GoLiveGate.find({
      organizationId,
      gateType: { $in: ['nabl_readiness', 'quality_manual', 'internal_audit'] }
    });

    const complianceGates = await ComplianceGate.find({
      organizationId,
      gateType: 'nabl_readiness'
    });

    // Calculate NABL readiness score
    const totalNablRequirements = 76; // ISO 15189:2022 requirements
    const completedRequirements = nablGates.filter(gate => gate.status === 'passed').length * 10 +
                                 complianceGates.filter(gate => gate.status === 'approved').length * 15;
    
    const readinessScore = Math.min(100, (completedRequirements / totalNablRequirements) * 100);

    // Determine phase
    let phase: 'preparation' | 'application' | 'assessment' | 'accredited';
    if (readinessScore < 60) phase = 'preparation';
    else if (readinessScore < 80) phase = 'application';
    else if (readinessScore < 95) phase = 'assessment';
    else phase = 'accredited';

    // Quality manual sections
    const qualityManualSections = [
      { name: 'Quality Policy & Objectives', status: 'completed', lastUpdated: '2024-01-15' },
      { name: 'Document Control', status: 'completed', lastUpdated: '2024-01-10' },
      { name: 'Management Responsibility', status: 'in_progress' },
      { name: 'Resource Management', status: 'in_progress' },
      { name: 'Pre-examination Processes', status: 'pending' },
      { name: 'Examination Processes', status: 'pending' },
      { name: 'Post-examination Processes', status: 'pending' },
      { name: 'Management System Improvement', status: 'pending' }
    ];

    const completedSections = qualityManualSections.filter(s => s.status === 'completed').length;
    const overallCompletion = (completedSections / qualityManualSections.length) * 100;

    // Proficiency testing status
    const proficiencyTests = [
      {
        testName: 'Clinical Chemistry PT',
        provider: 'CMC Vellore',
        dueDate: '2024-03-15',
        status: 'enrolled',
        score: 95
      },
      {
        testName: 'Hematology EQAS',
        provider: 'AIIMS Delhi',
        dueDate: '2024-02-28',
        status: 'completed',
        score: 92
      },
      {
        testName: 'Microbiology PT',
        provider: 'PGIMER Chandigarh',
        dueDate: '2024-04-10',
        status: 'pending'
      }
    ];

    // Internal audit schedule
    const auditSchedule = [
      {
        type: 'Internal Audit - Pre-examination',
        date: '2024-02-20',
        auditor: 'Quality Manager',
        status: 'scheduled'
      },
      {
        type: 'Internal Audit - Examination',
        date: '2024-03-05',
        auditor: 'Technical Manager',
        status: 'pending'
      },
      {
        type: 'Management Review',
        date: '2024-03-20',
        auditor: 'Laboratory Director',
        status: 'pending'
      }
    ];

    // Document control status
    const documentControl = {
      totalDocuments: 45,
      controlledDocuments: 38,
      pendingReview: 7,
      overdueDocs: 2
    };

    // NABL requirements checklist
    const nablRequirements = [
      { category: 'General Requirements', completed: 8, total: 10 },
      { category: 'Structural Requirements', completed: 6, total: 8 },
      { category: 'Resource Requirements', completed: 12, total: 15 },
      { category: 'Process Requirements', completed: 18, total: 25 },
      { category: 'Management System', completed: 9, total: 12 },
      { category: 'Improvement Requirements', completed: 3, total: 6 }
    ];

    // Calculate estimated accreditation date
    const estimatedAccreditationDate = new Date();
    estimatedAccreditationDate.setMonth(estimatedAccreditationDate.getMonth() + 
      Math.ceil((100 - readinessScore) / 10));

    return NextResponse.json({
      success: true,
      nablStatus: {
        readinessScore: Math.round(readinessScore),
        phase,
        nextMilestone: phase === 'preparation' ? 'Complete Quality Manual' :
                      phase === 'application' ? 'Submit NABL Application' :
                      phase === 'assessment' ? 'Assessment Visit' : 'Maintain Accreditation',
        estimatedAccreditationDate: estimatedAccreditationDate.toISOString().split('T')[0]
      },
      qualityManual: {
        sections: qualityManualSections,
        overallCompletion: Math.round(overallCompletion)
      },
      proficiencyTests,
      auditSchedule,
      documentControl,
      nablRequirements,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching NABL status:", error);
    return NextResponse.json(
      { error: "Failed to fetch NABL status" },
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
    const { action, data } = body;

    await connectDB();

    const organizationId = session.user.organizationId;

    switch (action) {
      case 'update_quality_manual':
        // Update quality manual section status
        const { sectionName, status } = data;
        
        // In a real implementation, this would update a QualityManual model
        // For now, we'll update a related gate
        await GoLiveGate.findOneAndUpdate(
          { organizationId, name: 'Quality Manual Approved' },
          {
            organizationId,
            name: 'Quality Manual Approved',
            gateType: 'quality_manual',
            status: status === 'completed' ? 'passed' : 'pending',
            isHardGate: false,
            details: { lastUpdatedSection: sectionName }
          },
          { upsert: true }
        );
        break;

      case 'schedule_audit':
        // Schedule internal audit
        const { auditType, date, auditor } = data;
        
        // Create audit record (in real implementation, would use Audit model)
        await GoLiveGate.findOneAndUpdate(
          { organizationId, name: `Internal Audit - ${auditType}` },
          {
            organizationId,
            name: `Internal Audit - ${auditType}`,
            gateType: 'internal_audit',
            status: 'pending',
            isHardGate: false,
            details: { scheduledDate: date, auditor }
          },
          { upsert: true }
        );
        break;

      case 'enroll_proficiency_test':
        // Enroll in proficiency testing program
        const { testName, provider } = data;
        
        // Create PT enrollment record
        await GoLiveGate.findOneAndUpdate(
          { organizationId, name: `PT Enrollment - ${testName}` },
          {
            organizationId,
            name: `PT Enrollment - ${testName}`,
            gateType: 'nabl_readiness',
            status: 'pending',
            isHardGate: false,
            details: { provider, enrollmentDate: new Date() }
          },
          { upsert: true }
        );
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${action} completed successfully`
    });
  } catch (error) {
    console.error("Error updating NABL status:", error);
    return NextResponse.json(
      { error: "Failed to update NABL status" },
      { status: 500 }
    );
  }
}