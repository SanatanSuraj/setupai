/**
 * /api/compliance/bmw
 *
 * BMW (Bio-Medical Waste) Authorization endpoints.
 *
 * POST  – Submit a BMW application.  Writes to ComplianceGate AND GoLiveGate
 *         atomically inside a transaction so both collections are always in sync.
 *
 * PATCH – Update BMW approval status.  Same dual-write, same transaction.
 *
 * GET   – Fetch current BMW status (read-only, no transaction needed).
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ComplianceGate } from "@/models/ComplianceGate";
import { GoLiveGate } from "@/models/GoLiveGate";
import { connectDB } from "@/lib/mongodb";
import {
  withTransaction,
  sessionOpt,
  apiError,
  unauthorized,
  badRequest,
  notFound,
  newRequestId,
} from "@/lib/db-helpers";

/* ─── GET ─────────────────────────────────────────────────────────────────── */

export async function GET(request: NextRequest) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    await connectDB();

    const [bmwGate, goLiveBMW] = await Promise.all([
      ComplianceGate.findOne({
        organizationId: session.user.organizationId,
        gateType: "bmw_authorization",
      }),
      GoLiveGate.findOne({
        organizationId: session.user.organizationId,
        gateType: "bmw_authorization",
      }),
    ]);

    return NextResponse.json({
      complianceGate: bmwGate,
      goLiveGate: goLiveBMW,
      canProceed: bmwGate?.canProceed() ?? false,
      isExpired: bmwGate?.isExpired() ?? false,
      isRenewalDue: bmwGate?.isRenewalDue() ?? false,
      requestId,
    });
  } catch (error) {
    console.error("[GET /api/compliance/bmw]", error);
    return apiError("Failed to fetch BMW status", { status: 500, requestId, detail: error });
  }
}

/* ─── POST ────────────────────────────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const body = await request.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body", requestId);

    const {
      cbwtfContract,
      authorizationDetails,
      documents,
      applicationNumber,
      submittedDate,
      authority,
      fees,
    } = body;

    await connectDB();

    const orgId = session.user.organizationId;
    const userId = session.user.id;

    // ── Atomic dual-write ──────────────────────────────────────────────────
    const { bmwGate } = await withTransaction(async (txSession) => {
      const bmwGate = await ComplianceGate.findOneAndUpdate(
        {
          organizationId: orgId,
          gateType: "bmw_authorization",
        },
        {
          $set: {
            organizationId: orgId,
            gateType: "bmw_authorization",
            status: "in_progress",
            hardGate: true,
            enforcementActions: {
              blockPhaseProgression: true,
              blockGoLive: true,
              generateAlert: true,
            },
            documents: documents ?? [],
            applicationDetails: {
              applicationNumber,
              submittedDate: submittedDate ? new Date(submittedDate) : new Date(),
              authority,
              fees,
            },
            stateSpecificRules: {
              cbwtfContract: cbwtfContract ?? {},
            },
            lastUpdated: new Date(),
            updatedBy: userId ?? null,
            requestId,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          context: "query",
          ...sessionOpt(txSession),
        }
      );

      await GoLiveGate.findOneAndUpdate(
        {
          organizationId: orgId,
          gateType: "bmw_authorization",
        },
        {
          $set: {
            organizationId: orgId,
            name: "BMW Authorization Approved",
            gateType: "bmw_authorization",
            status: "pending",
            isHardGate: true,
            bmwValidation: {
              authorizationStatus: "applied",
              cbwtfContract,
              hardGateEnforcement: true,
            },
            documents: documents ?? [],
            blockingReason:
              "BMW authorization must be approved before go-live",
            actionRequired:
              "Complete BMW authorization application and obtain approval from State Pollution Control Board",
            updatedBy: userId ?? null,
            requestId,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          context: "query",
          ...sessionOpt(txSession),
        }
      );

      return { bmwGate };
    });

    // Suppress unused-variable warning; authorizationDetails may be used later
    void authorizationDetails;

    return NextResponse.json({
      success: true,
      bmwGate,
      message: "BMW application submitted successfully",
      requestId,
    });
  } catch (error) {
    console.error("[POST /api/compliance/bmw]", error);
    return apiError("Failed to update BMW status", { status: 500, requestId, detail: error });
  }
}

/* ─── PATCH ───────────────────────────────────────────────────────────────── */

export async function PATCH(request: NextRequest) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const body = await request.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body", requestId);

    const { status, approvalDate, expiryDate, authorizationNumber, documents } =
      body;

    const ALLOWED = ["in_progress", "approved", "rejected", "expired"] as const;
    type AllowedStatus = (typeof ALLOWED)[number];
    if (!status || !ALLOWED.includes(status as AllowedStatus)) {
      return badRequest(
        `status must be one of: ${ALLOWED.join(", ")}`,
        requestId
      );
    }

    await connectDB();

    const orgId2 = session.user.organizationId;
    const userId2 = session.user.id;

    // ── Atomic dual-write ──────────────────────────────────────────────────
    const { bmwGate } = await withTransaction(async (txSession) => {
      const bmwGate = await ComplianceGate.findOneAndUpdate(
        {
          organizationId: orgId2,
          gateType: "bmw_authorization",
        },
        {
          $set: {
            status,
            ...(documents && { documents }),
            ...(approvalDate && {
              "applicationDetails.approvalDate": new Date(approvalDate),
            }),
            ...(expiryDate && {
              "applicationDetails.expiryDate": new Date(expiryDate),
            }),
            ...(authorizationNumber && {
              "applicationDetails.applicationNumber": authorizationNumber,
            }),
            lastUpdated: new Date(),
            updatedBy: userId2 ?? null,
            requestId,
          },
        },
        {
          new: true,
          runValidators: true,
          context: "query",
          ...sessionOpt(txSession),
        }
      );

      const goLiveStatus = status === "approved" ? "passed" : "pending";
      const authStatus =
        status === "approved"
          ? "approved"
          : status === "expired"
          ? "expired"
          : "applied";

      await GoLiveGate.findOneAndUpdate(
        {
          organizationId: orgId2,
          gateType: "bmw_authorization",
        },
        {
          $set: {
            status: goLiveStatus,
            "bmwValidation.authorizationStatus": authStatus,
            ...(documents && { documents }),
            blockingReason:
              status === "approved"
                ? null
                : "BMW authorization must be approved before go-live",
            actionRequired:
              status === "approved"
                ? null
                : "Complete BMW authorization application and obtain approval from State Pollution Control Board",
            updatedBy: userId2 ?? null,
            requestId,
          },
        },
        {
          runValidators: true,
          context: "query",
          ...sessionOpt(txSession),
        }
      );

      return { bmwGate };
    });

    if (!bmwGate) return notFound("BMW compliance gate not found", requestId);

    return NextResponse.json({
      success: true,
      bmwGate,
      canProceed: bmwGate.canProceed(),
      message:
        status === "approved"
          ? "BMW authorization approved — Go-live gate unlocked"
          : "BMW status updated",
      requestId,
    });
  } catch (error) {
    console.error("[PATCH /api/compliance/bmw]", error);
    return apiError("Failed to update BMW approval status", {
      status: 500,
      requestId,
      detail: error,
    });
  }
}
