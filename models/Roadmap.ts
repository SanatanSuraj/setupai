import mongoose, { Schema, Model } from "mongoose";
import type { IRoadmap } from "@/types";
import { auditPlugin } from "@/lib/mongoose-plugins";

const RoadmapSchema = new Schema<IRoadmap>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    tasks: [{ type: Schema.Types.Mixed }],
    phases: [{ type: Schema.Types.Mixed }],
    progress: { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 },
    timeline: {
      start: { type: Date, required: true },
      end:   { type: Date, required: true },
    },
    // Lab metadata — stored so the roadmap page can display context
    labType:  { type: String },
    state:    { type: String },
    district: { type: String },
    city:     { type: String },
  },
  { timestamps: true }
);

// One roadmap per organization
RoadmapSchema.index({ organizationId: 1 }, { unique: true });

RoadmapSchema.plugin(auditPlugin);

export const Roadmap: Model<IRoadmap> = mongoose.models.Roadmap ?? mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);
