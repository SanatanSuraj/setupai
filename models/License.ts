import mongoose, { Schema, Model } from "mongoose";
import type { ILicense, LicenseStatus } from "@/types";

const LicenseSchema = new Schema<ILicense>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    type: { type: String, required: true },
    state: { type: String, required: true },
    status: { type: String, enum: ["pending", "applied", "approved", "rejected"] as LicenseStatus[], default: "pending" },
    renewalDate: { type: Date },
    documents: [{
      name: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now },
    }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const License: Model<ILicense> = mongoose.models.License ?? mongoose.model<ILicense>("License", LicenseSchema);
