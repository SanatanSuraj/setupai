import mongoose, { Schema, Model } from "mongoose";
import type { IFinancialModel } from "@/types";

const FinancialModelSchema = new Schema<IFinancialModel>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    capex: { type: Number, default: 0 },
    opex: { type: Number, default: 0 },
    revenueProjection: [{ type: Number }],
    breakEvenMonths: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const FinancialModel: Model<IFinancialModel> = mongoose.models.FinancialModel ?? mongoose.model<IFinancialModel>("FinancialModel", FinancialModelSchema);
