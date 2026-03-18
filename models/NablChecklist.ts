/**
 * NablChecklist model
 *
 * Stores per-organization document checklist state for NABL accreditation.
 * Keys are in format "sectionId-itemIndex" (e.g. "A-0", "B-3").
 */

import mongoose, { Schema, Document, Model } from "mongoose";

export interface INablChecklist {
  organizationId: mongoose.Types.ObjectId;
  /** Map of "sectionId-itemIndex" -> boolean (checked) */
  checkedItems: Record<string, boolean>;
}

export interface NablChecklistDocument extends INablChecklist, Document {}

const NablChecklistSchema = new Schema<NablChecklistDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
      unique: true,
    },
    checkedItems: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const NablChecklist: Model<NablChecklistDocument> =
  mongoose.models.NablChecklist ??
  mongoose.model<NablChecklistDocument>("NablChecklist", NablChecklistSchema);
