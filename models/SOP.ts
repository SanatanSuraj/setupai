import mongoose, { Schema, Model } from "mongoose";
import type { ISOP } from "@/types";

const SOPSchema = new Schema<ISOP>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    module: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SOP: Model<ISOP> = mongoose.models.SOP ?? mongoose.model<ISOP>("SOP", SOPSchema);
