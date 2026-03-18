/**
 * mongoose-plugins.ts
 *
 * Reusable Mongoose schema plugins for production-grade cross-cutting concerns:
 *
 *  auditPlugin   Adds createdBy, updatedBy, requestId to every document.
 *                These fields are optional so existing documents are not
 *                invalidated on migration.
 *
 * Usage (in each model file):
 *   import { auditPlugin } from "@/lib/mongoose-plugins";
 *   MySchema.plugin(auditPlugin);
 */

import { Schema } from "mongoose";

/* ─── Audit plugin ────────────────────────────────────────────────────────── */

/**
 * Fields injected by the plugin:
 *
 *  createdBy   ObjectId of the User who created the document.
 *  updatedBy   ObjectId of the User who last modified the document.
 *  requestId   UUID of the HTTP request that triggered the write (for log
 *              correlation across services).
 */
export function auditPlugin(schema: Schema): void {
  schema.add({
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    requestId: {
      type: String,
      default: null,
      index: true,
    },
  });
}

/* ─── Soft-delete plugin (bonus) ─────────────────────────────────────────── */

/**
 * Adds `deletedAt` / `isDeleted` to a schema and patches `find*` queries
 * to exclude soft-deleted documents by default.
 *
 * Usage:
 *   MySchema.plugin(softDeletePlugin);
 *
 * To include deleted docs pass `{ includeDeleted: true }` to the query:
 *   Model.find({}).setOptions({ includeDeleted: true })
 */
export function softDeletePlugin(schema: Schema): void {
  schema.add({
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  });

  // Patch all find-type queries to filter out deleted docs
  const queryFilter = function (this: { _conditions: Record<string, unknown>; options: Record<string, unknown> }) {
    if (!this.options?.includeDeleted) {
      if (this._conditions.isDeleted === undefined) {
        this._conditions.isDeleted = { $ne: true };
      }
    }
  };

  for (const method of ["find", "findOne", "findOneAndUpdate", "countDocuments", "count"] as const) {
    schema.pre(method as "find", queryFilter);
  }
}
