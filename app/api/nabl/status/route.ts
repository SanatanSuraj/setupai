import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { GoLiveGate } from "@/models/GoLiveGate";
import { ComplianceGate } from "@/models/ComplianceGate";
import { NablChecklist } from "@/models/NablChecklist";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
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

    // Quality manual: read actual status from GoLiveGate records
    const QUALITY_SECTIONS = [
      'Quality Policy & Objectives',
      'Document Control',
      'Management Responsibility',
      'Resource Management',
      'Pre-examination Processes',
      'Examination Processes',
      'Post-examination Processes',
      'Management System Improvement',
    ];

    const qualityManualGate = await GoLiveGate.findOne({
      organizationId,
      name: 'Quality Manual Approved',
      gateType: 'quality_manual',
    }).lean();

    // Build section list; mark as 'completed' if the gate has been passed
    // and any sectionName stored in details matches, else treat gate-level pass
    // as all sections completed.
    const lastUpdatedSection: string | undefined =
      (qualityManualGate?.details as { lastUpdatedSection?: string } | undefined)
        ?.lastUpdatedSection;

    const qualityManualSections = QUALITY_SECTIONS.map((name) => ({
      name,
      status:
        qualityManualGate?.status === 'passed'
          ? 'completed'
          : name === lastUpdatedSection
          ? 'in_progress'
          : 'pending',
    }));

    const completedSections = qualityManualSections.filter(
      (s) => s.status === 'completed'
    ).length;
    const overallCompletion = (completedSections / qualityManualSections.length) * 100;

    // Proficiency tests: read from GoLiveGates of type 'nabl_readiness' that have
    // PT-specific naming. Map to frontend shape: testName, provider, dueDate, status, score
    const ptGates = await GoLiveGate.find({
      organizationId,
      name: /^PT Enrollment - /,
    }).lean();
    const proficiencyTests = ptGates.map((g) => {
      const d = g.details as { provider?: string; dueDate?: string; enrollmentDate?: string; score?: number } | undefined;
      return {
        testName: g.name.replace('PT Enrollment - ', ''),
        provider: d?.provider ?? '',
        dueDate: d?.dueDate ?? d?.enrollmentDate ?? '',
        status: g.status === 'passed' ? 'completed' : (g.status === 'failed' ? 'overdue' : g.status),
        score: d?.score,
      };
    });

    // Audit schedule: read from GoLiveGates of type 'internal_audit'
    // Map to frontend shape: type, date, auditor, status
    const auditGates = await GoLiveGate.find({
      organizationId,
      gateType: 'internal_audit',
    }).lean();
    const auditSchedule = auditGates.map((g) => {
      const d = g.details as { scheduledDate?: string; date?: string; auditor?: string } | undefined;
      return {
        type: g.name.replace('Internal Audit - ', ''),
        date: d?.scheduledDate ?? d?.date ?? '',
        auditor: d?.auditor ?? '',
        status: g.status === 'passed' ? 'completed' : g.status,
      };
    });

    // Document checklist: persisted checkbox state per section-item (e.g. "A-0", "B-3")
    // PRIMARY: Read from NablChecklist (canonical store for checkbox state)
    // FALLBACK: GoLiveGate.details.checklist for backwards compatibility
    let checklist: Record<string, boolean> = {};
    const nablChecklistDoc = await NablChecklist.findOne({ organizationId }).lean();
    if (nablChecklistDoc?.checkedItems && typeof nablChecklistDoc.checkedItems === 'object') {
      checklist = nablChecklistDoc.checkedItems;
    } else {
      const checklistGate = await GoLiveGate.findOne({
        organizationId,
        gateType: 'nabl_document_checklist',
      }).lean();
      checklist =
        (checklistGate?.details as { checklist?: Record<string, boolean> } | undefined)?.checklist ?? {};
    }

    // Document control starts at zero
    const documentControl = {
      totalDocuments: 0,
      controlledDocuments: 0,
      pendingReview: 0,
      overdueDocs: 0
    };

    // NABL requirements — all start at 0 completed
    const nablRequirements = [
      { category: 'General Requirements', completed: 0, total: 10 },
      { category: 'Structural Requirements', completed: 0, total: 8 },
      { category: 'Resource Requirements', completed: 0, total: 15 },
      { category: 'Process Requirements', completed: 0, total: 25 },
      { category: 'Management System', completed: 0, total: 12 },
      { category: 'Improvement Requirements', completed: 0, total: 6 }
    ];

    // Calculate estimated accreditation date
    const estimatedAccreditationDate = new Date();
    estimatedAccreditationDate.setMonth(estimatedAccreditationDate.getMonth() + 
      Math.ceil((100 - readinessScore) / 10));

    // Readiness score driven by checklist completion when available
    const checklistKeys = Object.keys(checklist);
    const checklistChecked = checklistKeys.filter((k) => checklist[k]).length;
    const totalChecklistItems = 180; // DOCUMENT_SECTIONS total in frontend
    const checklistDrivenScore = checklistKeys.length > 0
      ? Math.round((checklistChecked / totalChecklistItems) * 100)
      : readinessScore;
    const effectivePhase =
      checklistDrivenScore < 40 ? 'preparation' :
      checklistDrivenScore < 70 ? 'application' :
      checklistDrivenScore < 90 ? 'assessment' : 'accredited';

    return NextResponse.json({
      success: true,
      nablStatus: {
        readinessScore: Math.round(checklistDrivenScore),
        phase: effectivePhase,
        nextMilestone: effectivePhase === 'preparation' ? 'Complete Quality Manual' :
                      effectivePhase === 'application' ? 'Submit NABL Application' :
                      effectivePhase === 'assessment' ? 'Assessment Visit' : 'Maintain Accreditation',
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
      checklist,
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
      case 'update_checklist': {
        const checkedItems = (data && typeof data === 'object' && !Array.isArray(data))
          ? (data as Record<string, boolean>)
          : {};
        const result = await NablChecklist.findOneAndUpdate(
          { organizationId },
          { $set: { checkedItems } },
          { upsert: true, new: true }
        );
        console.log("[NABL] Checklist persisted to NablChecklist:", Object.keys(checkedItems).filter((k) => checkedItems[k]).length, "items checked");
        if (!result) {
          console.error("[NABL] NablChecklist upsert returned null");
        }
        break;
      }

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
          { upsert: true, new: true }
        );
        break;

      case 'schedule_audit':
        // Schedule internal audit
        const { auditType, date, auditor } = data;
        await GoLiveGate.findOneAndUpdate(
          { organizationId, name: `Internal Audit - ${auditType}` },
          {
            organizationId,
            name: `Internal Audit - ${auditType}`,
            gateType: 'internal_audit',
            status: 'pending',
            isHardGate: false,
            details: { scheduledDate: date, date, auditor },
          },
          { upsert: true, new: true }
        );
        break;

      case 'enroll_proficiency_test':
        // Enroll in proficiency testing program
        const { testName, provider, dueDate, status: ptStatus, score } = data;
        const ptStatusMapped = ptStatus === 'completed' ? 'passed' : ptStatus === 'overdue' ? 'failed' : 'pending';
        await GoLiveGate.findOneAndUpdate(
          { organizationId, name: `PT Enrollment - ${testName}` },
          {
            organizationId,
            name: `PT Enrollment - ${testName}`,
            gateType: 'nabl_readiness',
            status: ptStatusMapped,
            isHardGate: false,
            details: {
              provider,
              enrollmentDate: new Date(),
              dueDate: dueDate || new Date().toISOString().split('T')[0],
              score,
            },
          },
          { upsert: true, new: true }
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