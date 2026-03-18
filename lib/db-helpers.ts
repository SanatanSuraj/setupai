/**
 * db-helpers.ts
 *
 * Production-grade database utilities:
 *  - withTransaction   wraps a multi-step write in a Mongoose session +
 *                      transaction, with graceful fallback for standalone
 *                      MongoDB instances that don't support transactions.
 *  - newRequestId      generates a per-request correlation ID.
 *  - apiError          standardised NextResponse error helper.
 */

import mongoose, { ClientSession } from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { randomUUID } from "crypto";

/* ─── Request ID ──────────────────────────────────────────────────────────── */

/** Generate a UUID v4 correlation ID for each inbound API request. */
export function newRequestId(): string {
  return randomUUID();
}

/* ─── Transaction wrapper ─────────────────────────────────────────────────── */

/**
 * Execute `fn` inside a Mongoose session + transaction.
 *
 * Falls back to a no-op "session" when the MongoDB deployment does not
 * support transactions (e.g., a standalone instance used in development).
 * This means the same code works in dev without a replica set while still
 * benefiting from ACID guarantees in production Atlas / replica-set clusters.
 *
 * Usage:
 *   const result = await withTransaction(async (session) => {
 *     const org = await Organization.create([{ ... }], { session });
 *     const user = await User.create([{ ... }], { session });
 *     return { org, user };
 *   });
 *
 * Note: When using session inside `create()` you MUST pass an array as the
 * first argument (Mongoose API requirement for sessionised bulk creates).
 */
export async function withTransaction<T>(
  fn: (session: ClientSession) => Promise<T>
): Promise<T> {
  await connectDB();
  const session = await mongoose.startSession();

  try {
    let result!: T;

    await session.withTransaction(async () => {
      result = await fn(session);
    });

    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    // Standalone MongoDB (e.g. local dev) doesn't support multi-document
    // transactions. Fall back to running the callback without a session so
    // development stays seamless.
    if (
      msg.includes("Transaction numbers") ||
      msg.includes("not supported") ||
      msg.includes("replica set") ||
      msg.includes("MongoServerError: Transaction")
    ) {
      console.warn(
        "[db-helpers] Transactions not supported on this MongoDB instance – " +
          "falling back to non-transactional writes. Enable a replica set for " +
          "full ACID guarantees in production."
      );
      // Pass null so callers using sessionOpt() will omit the session key entirely.
      // Passing undefined can still reach MongoDB's resolveOptions if Mongoose
      // spreads the options object and the driver checks `session?.inTransaction()`.
      return fn(null as unknown as ClientSession);
    }

    throw err;
  } finally {
    await session.endSession().catch(() => {});
  }
}

/* ─── Session option helper ───────────────────────────────────────────────── */

/**
 * Build a Mongoose/MongoDB options fragment that includes the session only
 * when one is available.  Always use this instead of `{ session }` directly
 * so the key is completely absent when running without a transaction (e.g.,
 * standalone MongoDB dev instance fallback).
 *
 * Usage:
 *   const [doc] = await Model.create([data], sessionOpt(txSession));
 *   await Model.findOneAndUpdate(filter, update, { ...sessionOpt(txSession), new: true });
 */
export function sessionOpt(
  session: ClientSession | null | undefined
): { session?: ClientSession } {
  return session ? { session } : {};
}

/* ─── Standardised API error responses ───────────────────────────────────── */

type ApiErrorOptions = {
  status?: number;
  requestId?: string;
  detail?: unknown;
};

/**
 * Return a consistent JSON error response.
 *
 * Shape: { error: string, requestId?: string, detail?: unknown }
 */
export function apiError(
  message: string,
  { status = 500, requestId, detail }: ApiErrorOptions = {}
): NextResponse {
  const body: Record<string, unknown> = { error: message };
  if (requestId) body.requestId = requestId;
  if (detail !== undefined && process.env.NODE_ENV !== "production") {
    body.detail = detail instanceof Error ? detail.message : detail;
  }
  return NextResponse.json(body, { status });
}

/** Shorthand for 401 Unauthorized */
export const unauthorized = (requestId?: string) =>
  apiError("Unauthorized", { status: 401, requestId });

/** Shorthand for 400 Bad Request */
export const badRequest = (msg: string, requestId?: string) =>
  apiError(msg, { status: 400, requestId });

/** Shorthand for 404 Not Found */
export const notFound = (msg = "Not found", requestId?: string) =>
  apiError(msg, { status: 404, requestId });

/* ─── Duplicate-key guard ─────────────────────────────────────────────────── */

/** Returns true when `err` is a MongoDB duplicate-key (E11000) error. */
export function isDuplicateKeyError(err: unknown): boolean {
  return (
    err instanceof mongoose.mongo.MongoServerError && err.code === 11000
  );
}
