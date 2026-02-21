import mongoose, { Schema, Model } from "mongoose";
import type { IQCLog } from "@/types";

const QCLogSchema = new Schema<IQCLog>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    testName: { type: String, required: true },
    value: { type: Number, required: true },
    controlRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    status: { type: String, enum: ["in_range", "out_of_range"], required: true },
    correctiveAction: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const QCLog: Model<IQCLog> = mongoose.models.QCLog ?? mongoose.model<IQCLog>("QCLog", QCLogSchema);
