/**
 * /api/go-live/checklist
 *
 * GET   – Returns the current org's static checklist tick state as a map
 *         { [itemId]: boolean }.
 * PATCH – Upserts a single item's checked state. Body: { itemId, checked }.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { GoLiveChecklistItem } from "@/models/GoLiveChecklistItem";
import {
  apiError,
  unauthorized,
  badRequest,
  newRequestId,
} from "@/lib/db-helpers";
import { z } from "zod";

const patchSchema = z.object({
  itemId: z.string().min(1).max(64),
  checked: z.boolean(),
});

export async function GET() {
  const requestId = newRequestId();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    await connectDB();
    const rows = await GoLiveChecklistItem.find({
      organizationId: session.user.organizationId,
    }).select({ itemId: 1, checked: 1, _id: 0 }).lean();

    const checks: Record<string, boolean> = {};
    for (const r of rows) checks[r.itemId] = r.checked;

    return NextResponse.json({ checks, requestId });
  } catch (error) {
    console.error("[GET /api/go-live/checklist]", error);
    return apiError("Failed to load checklist state", {
      status: 500,
      requestId,
      detail: error,
    });
  }
}

export async function PATCH(request: NextRequest) {
  const requestId = newRequestId();
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) return unauthorized(requestId);

    const body = await request.json().catch(() => null);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid body", requestId);
    }

    const { itemId, checked } = parsed.data;
    await connectDB();

    await GoLiveChecklistItem.findOneAndUpdate(
      { organizationId: session.user.organizationId, itemId },
      { $set: { checked } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return NextResponse.json({ ok: true, itemId, checked, requestId });
  } catch (error) {
    console.error("[PATCH /api/go-live/checklist]", error);
    return apiError("Failed to update checklist item", {
      status: 500,
      requestId,
      detail: error,
    });
  }
}
