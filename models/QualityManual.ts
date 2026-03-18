/**
 * QualityManual model
 *
 * Replaces the ad-hoc `GoLiveGate.details` approach for quality manual
 * tracking. Each document represents a single section of the Quality Manual
 * for one organisation, with a typed status and full audit trail.
 *
 * The GoLiveGate document of type `quality_manual` still exists as the gate
 * blocker/status entry; this model holds the rich section-level detail that
 * was previously jammed into the untyped `details` field.
 */

import mongoose, { Schema, Document, Model } from "mongoose";
import { auditPlugin } from "@/lib/mongoose-plugins";

/* ─── Types ───────────────────────────────────────────────────────────────── */

export type QualityManualStatus =
  | "not_started"
  | "draft"
  | "under_review"
  | "approved"
  | "rejected";

export interface IQualityManualSection {
  organizationId: mongoose.Types.ObjectId;
  /** e.g., "QM-01", "QM-02" */
  sectionCode: string;
  /** Human-readable section title */
  title: string;
  description?: string;
  status: QualityManualStatus;
  /** ISO date string when the section was approved (if applicable) */
  approvedAt?: Date;
  /** Free-form reviewer notes */
  reviewerNotes?: string;
  /** URL or key to the uploaded section document */
  documentUrl?: string;
  version: number;
  /** Audit fields (injected by auditPlugin) */
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  requestId?: string | null;
}

export interface QualityManualDocument extends IQualityManualSection, Document {}

/* ─── Pre-defined NABL Quality Manual sections ───────────────────────────── */

export const QUALITY_MANUAL_SECTIONS = [
  { sectionCode: "QM-01", title: "Scope and Application" },
  { sectionCode: "QM-02", title: "Normative References" },
  { sectionCode: "QM-03", title: "Terms and Definitions" },
  { sectionCode: "QM-04", title: "General Requirements" },
  { sectionCode: "QM-05", title: "Structural Requirements" },
  { sectionCode: "QM-06", title: "Resource Requirements" },
  { sectionCode: "QM-07", title: "Process Requirements" },
  { sectionCode: "QM-08", title: "Management System Requirements" },
] as const;

/* ─── Schema ──────────────────────────────────────────────────────────────── */

const QualityManualSchema = new Schema<QualityManualDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    sectionCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ["not_started", "draft", "under_review", "approved", "rejected"] as QualityManualStatus[],
      default: "not_started",
    },
    approvedAt: { type: Date },
    reviewerNotes: { type: String, trim: true },
    documentUrl: { type: String, trim: true },
    version: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

/* One section per organisation – duplicate sectionCodes are prevented */
QualityManualSchema.index(
  { organizationId: 1, sectionCode: 1 },
  { unique: true }
);

/* Apply audit fields (createdBy / updatedBy / requestId) */
QualityManualSchema.plugin(auditPlugin);

/* ─── Model ───────────────────────────────────────────────────────────────── */

export const QualityManual: Model<QualityManualDocument> =
  mongoose.models.QualityManual ||
  mongoose.model<QualityManualDocument>("QualityManual", QualityManualSchema);
