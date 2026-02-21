import mongoose, { Schema, Model } from "mongoose";
import type { IRoadmap } from "@/types";
import { taskSchema } from "./Task";

const RoadmapSchema = new Schema<IRoadmap>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    tasks: [{ type: Schema.Types.Mixed }],
    progress: { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 },
    timeline: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Roadmap: Model<IRoadmap> = mongoose.models.Roadmap ?? mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);
