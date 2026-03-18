/**
 * /api/compliance/readiness
 *
 * GET   – Check overall go-live readiness across ComplianceGate + GoLiveGate.
 * POST  – Initialise all default compliance gates for an organisation.
 *         Writes to ComplianceGate AND GoLiveGate atomically.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ComplianceGate } from "@/models/ComplianceGate";
import { GoLiveGate } from "@/models/GoLiveGate";
import { StateRegulatoryProfile } from "@/models/StateRegulatoryProfile";
import { connectDB } from "@/lib/mongodb";
import {
  withTransaction,
  sessionOpt,
  apiError,
  unauthorized,
  newRequestId,
} from "@/lib/db-helpers";

/* ─── GET ─────────────────────────────────────────────────────────────────── */

export async function GET(request: NextRequest) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CGStatic = ComplianceGate as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const GLStatic = GoLiveGate as any;

    const [complianceReadiness, goLiveReadiness, complianceGates, goLiveGates] =
      await Promise.all([
        CGStatic.checkGoLiveReadiness(session.user.organizationId),
        GLStatic.checkGoLiveReadiness(session.user.organizationId),
        ComplianceGate.find({ organizationId: session.user.organizationId }).sort({ createdAt: 1 }),
        GoLiveGate.find({ organizationId: session.user.organizationId }).sort({ createdAt: 1 }),
      ]);

    const totalGates = complianceGates.length + goLiveGates.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const passedGates =
      complianceGates.filter((g: any) => g.status === "approved").length +
      goLiveGates.filter((g: any) => g.status === "passed").length;

    const overallCompletion = totalGates > 0 ? (passedGates / totalGates) * 100 : 0;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const criticalBlockers = [
      ...complianceGates.filter((g: any) => g.hardGate && !g.canProceed()),
      ...goLiveGates.filter((g: any) => g.isHardGate && !g.canProceed()),
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bmwGate = complianceGates.find((g: any) => g.gateType === "bmw_authorization") as any;
    const bmwStatus = {
      exists: !!bmwGate,
      status: bmwGate?.status ?? "not_started",
      canProceed: bmwGate?.canProceed() ?? false,
      isExpired: bmwGate?.isExpired() ?? false,
      isRenewalDue: bmwGate?.isRenewalDue() ?? false,
      expiryDate: bmwGate?.applicationDetails?.expiryDate,
      renewalDue: bmwGate?.applicationDetails?.renewalDue,
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
      gates: { compliance: complianceGates, goLive: goLiveGates },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      blockers: criticalBlockers.map((gate: any) => ({
        name: gate.name,
        type: gate.gateType ?? "unknown",
        reason: gate.blockingReason,
        actionRequired: gate.actionRequired,
      })),
      requestId,
    });
  } catch (error) {
    console.error("[GET /api/compliance/readiness]", error);
    return apiError("Failed to check go-live readiness", {
      status: 500,
      requestId,
      detail: error,
    });
  }
}

/* ─── POST ────────────────────────────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const body = await request.json().catch(() => ({}));
    const { state, labType, district } = body as {
      state?: string;
      labType?: string;
      district?: string;
    };

    await connectDB();

    const orgId = session.user.organizationId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const CGStaticPost = ComplianceGate as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const GLStaticPost = GoLiveGate as any;

    // ── Atomic: initialise both gate collections ────────────────────────────
    await withTransaction(async (txSession) => {
      // Pass txSession only when it's a real session (replica-set) so that
      // standalone MongoDB dev instances don't receive a null/undefined session
      // value that confuses the driver.
      const so = sessionOpt(txSession);
      await CGStaticPost.initializeStateGates(orgId, state, so.session);
      await GLStaticPost.initializeDefaultGates(orgId, so.session);
    });

    // Regulatory profile is read-only context — fetch after transaction
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SRPStatic = StateRegulatoryProfile as any;
    const stateProfile: any = state ? await SRPStatic.getByState(state) : null;

    let stateProfileData: Record<string, unknown> = {
      state,
      note: "State regulatory profile not yet seeded — gates initialized with defaults.",
    };

    if (stateProfile) {
      const [requiredLicenses, districtRules, cbwtfVendors, estimatedTimeline] =
        await Promise.all([
          SRPStatic.getRequiredLicenses(state!, labType),
          district ? Promise.resolve(stateProfile.getDistrictRules(district)) : Promise.resolve(null),
          Promise.resolve(district ? stateProfile.getCBWTFVendors(district) : stateProfile.cbwtfVendors),
          Promise.resolve(stateProfile.getEstimatedTimeline(labType, district ?? "")),
        ]);

      stateProfileData = {
        state: stateProfile.state,
        requiredLicenses,
        districtRules,
        cbwtfVendors,
        estimatedTimeline,
      };
    }

    return NextResponse.json({
      success: true,
      message: "Compliance gates initialized successfully",
      stateProfile: stateProfileData,
      requestId,
    });
  } catch (error) {
    console.error("[POST /api/compliance/readiness]", error);
    return apiError("Failed to initialize compliance gates", {
      status: 500,
      requestId,
      detail: error,
    });
  }
}
