/**
 * /api/training  –  list all training records for the org  (GET)
 *                –  enrol a staff member in a training module (POST)
 *
 * Unique constraint: one record per (organizationId, staffId, module).
 * Attempting to re-enrol the same staff member in the same module
 * returns 409 Conflict instead of creating a duplicate.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Training } from "@/models/Training";
import { Staff } from "@/models/Staff";
import {
  apiError,
  badRequest,
  isDuplicateKeyError,
  newRequestId,
  unauthorized,
} from "@/lib/db-helpers";

const ALLOWED_STATUSES = ["pending", "started", "completed", "failed"] as const;
type TrainingStatus = (typeof ALLOWED_STATUSES)[number];

/* ─── GET /api/training ───────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    await connectDB();

    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status");
    const module = searchParams.get("module");

    const filter: Record<string, unknown> = {
      organizationId: session.user.organizationId,
    };
    if (staffId) filter.staffId = staffId;
    if (status && ALLOWED_STATUSES.includes(status as TrainingStatus)) {
      filter.status = status;
    }
    if (module) filter.module = module;

    const records = await Training.find(filter)
      .populate("staffId", "name role")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: records, requestId });
  } catch (err) {
    console.error("[GET /api/training]", err);
    return apiError("Failed to fetch training records", { status: 500, requestId, detail: err });
  }
}

/* ─── POST /api/training ──────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body", requestId);

    const { staffId, module, role, status, score, completedAt } = body;

    if (!staffId || typeof staffId !== "string") {
      return badRequest("staffId is required", requestId);
    }
    if (!module || typeof module !== "string" || module.trim() === "") {
      return badRequest("module is required", requestId);
    }
    if (!role || typeof role !== "string" || role.trim() === "") {
      return badRequest("role is required", requestId);
    }
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return badRequest(
        `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        requestId
      );
    }
    if (score !== undefined && (typeof score !== "number" || score < 0 || score > 100)) {
      return badRequest("score must be a number between 0 and 100", requestId);
    }

    await connectDB();

    // Verify that the staff member belongs to this organisation
    const staffMember = await Staff.findOne({
      _id: staffId,
      organizationId: session.user.organizationId,
    }).lean();

    if (!staffMember) {
      return apiError("Staff member not found in this organisation", {
        status: 404,
        requestId,
      });
    }

    try {
      const training = await Training.create({
        organizationId: session.user.organizationId,
        staffId,
        module: module.trim(),
        role: role.trim(),
        status: status ?? "pending",
        ...(score !== undefined && { score }),
        ...(completedAt && { completedAt: new Date(completedAt) }),
        createdBy: session.user.id ?? null,
        requestId,
      });

      return NextResponse.json({ data: training, requestId }, { status: 201 });
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        return apiError(
          "This staff member is already enrolled in this module. Use PATCH /api/training/:id to update.",
          { status: 409, requestId }
        );
      }
      throw err;
    }
  } catch (err) {
    console.error("[POST /api/training]", err);
    return apiError("Failed to create training record", { status: 500, requestId, detail: err });
  }
}
