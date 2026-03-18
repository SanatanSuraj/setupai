import mongoose, { Schema, Document, Model } from "mongoose";
import { auditPlugin } from "@/lib/mongoose-plugins";

export interface ITraining {
  organizationId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  /** e.g., "Device Operation", "BMW Compliance" */
  module: string;
  role: string;
  status: "pending" | "started" | "completed" | "failed";
  score?: number;
  completedAt?: Date;
  reviewerNotes?: string;
  /** Audit fields (injected by auditPlugin) */
  createdBy?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  requestId?: string | null;
}

export interface TrainingDocument extends ITraining, Document {}

const TrainingSchema = new Schema<TrainingDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    module: { type: String, required: true, trim: true },
    role:   { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "started", "completed", "failed"],
      default: "pending",
    },
    score:         { type: Number, min: 0, max: 100 },
    completedAt:   { type: Date },
    reviewerNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

/**
 * Unique index: one enrolment per staff member per module per organisation.
 * Prevents duplicate training records from concurrent requests.
 */
TrainingSchema.index(
  { organizationId: 1, staffId: 1, module: 1 },
  { unique: true }
);

TrainingSchema.plugin(auditPlugin);

export const Training: Model<TrainingDocument> =
  mongoose.models.Training ||
  mongoose.model<TrainingDocument>("Training", TrainingSchema);
