import mongoose, { Schema, Model } from "mongoose";
import type { ISampleOrder, SampleOrderStatus } from "@/types";

const SampleOrderSchema = new Schema<ISampleOrder>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    patientName: { type: String, required: true },
    testType: { type: String, required: true },
    status: { type: String, enum: ["collected", "testing", "qc", "report_generated", "delivered"] as SampleOrderStatus[], default: "collected" },
    TAT: { type: Number },
    collectedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SampleOrder: Model<ISampleOrder> = mongoose.models.SampleOrder ?? mongoose.model<ISampleOrder>("SampleOrder", SampleOrderSchema);
