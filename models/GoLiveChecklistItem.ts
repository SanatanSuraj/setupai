import mongoose, { Schema, Model } from "mongoose";

/**
 * Per-organisation tick state for the static Go Live checklist items
 * (the ones not backed by GoLiveGate). One document per (org, itemId).
 */
export interface IGoLiveChecklistItem {
  _id: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  itemId: string;          // stable id from lib/go-live-checklist.ts (e.g. "infra-3")
  checked: boolean;
  updatedAt: Date;
  createdAt: Date;
}

const GoLiveChecklistItemSchema = new Schema<IGoLiveChecklistItem>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    itemId: { type: String, required: true },
    checked: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

GoLiveChecklistItemSchema.index({ organizationId: 1, itemId: 1 }, { unique: true });

export const GoLiveChecklistItem: Model<IGoLiveChecklistItem> =
  (mongoose.models.GoLiveChecklistItem as Model<IGoLiveChecklistItem>) ??
  mongoose.model<IGoLiveChecklistItem>(
    "GoLiveChecklistItem",
    GoLiveChecklistItemSchema,
  );
