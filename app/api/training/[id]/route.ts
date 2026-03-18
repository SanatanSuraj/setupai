/**
 * /api/training/:id  –  get one record  (GET)
 *                    –  update status/score  (PATCH)
 *                    –  delete a record  (DELETE)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Training } from "@/models/Training";
import {
  apiError,
  badRequest,
  newRequestId,
  notFound,
  unauthorized,
} from "@/lib/db-helpers";

const ALLOWED_STATUSES = ["pending", "started", "completed", "failed"] as const;
type TrainingStatus = (typeof ALLOWED_STATUSES)[number];

type RouteContext = { params: Promise<{ id: string }> };

/* ─── GET /api/training/:id ───────────────────────────────────────────────── */

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const { id } = await params;
    await connectDB();

    const record = await Training.findOne({
      _id: id,
      organizationId: session.user.organizationId,
    })
      .populate("staffId", "name role")
      .lean();

    if (!record) return notFound("Training record not found", requestId);

    return NextResponse.json({ data: record, requestId });
  } catch (err) {
    console.error("[GET /api/training/:id]", err);
    return apiError("Failed to fetch training record", { status: 500, requestId, detail: err });
  }
}

/* ─── PATCH /api/training/:id ─────────────────────────────────────────────── */

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const { id } = await params;

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body", requestId);

    const { status, score, completedAt, reviewerNotes } = body;

    if (status !== undefined && !ALLOWED_STATUSES.includes(status as TrainingStatus)) {
      return badRequest(
        `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
        requestId
      );
    }
    if (score !== undefined && (typeof score !== "number" || score < 0 || score > 100)) {
      return badRequest("score must be a number between 0 and 100", requestId);
    }

    await connectDB();

    const update: Record<string, unknown> = {
      updatedBy: session.user.id ?? null,
      requestId,
    };
    if (status !== undefined) update.status = status;
    if (score !== undefined) update.score = score;
    if (completedAt !== undefined) {
      update.completedAt = completedAt ? new Date(completedAt) : null;
    }
    if (reviewerNotes !== undefined) update.reviewerNotes = reviewerNotes;

    // If marking as completed without an explicit completedAt, auto-set it
    if (status === "completed" && !completedAt) {
      update.completedAt = new Date();
    }

    const updated = await Training.findOneAndUpdate(
      { _id: id, organizationId: session.user.organizationId },
      { $set: update },
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    ).lean();

    if (!updated) return notFound("Training record not found", requestId);

    return NextResponse.json({ data: updated, requestId });
  } catch (err) {
    console.error("[PATCH /api/training/:id]", err);
    return apiError("Failed to update training record", { status: 500, requestId, detail: err });
  }
}

/* ─── DELETE /api/training/:id ────────────────────────────────────────────── */

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const { id } = await params;
    await connectDB();

    const deleted = await Training.findOneAndDelete({
      _id: id,
      organizationId: session.user.organizationId,
    }).lean();

    if (!deleted) return notFound("Training record not found", requestId);

    return NextResponse.json({ success: true, requestId });
  } catch (err) {
    console.error("[DELETE /api/training/:id]", err);
    return apiError("Failed to delete training record", { status: 500, requestId, detail: err });
  }
}
