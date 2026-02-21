import mongoose, { Schema, Model } from "mongoose";
import type { IOrganization, LabType, SubscriptionTier } from "@/types";

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    labType: { type: String, enum: ["basic", "medium", "advanced", "clinic_lab"] as LabType[] },
    city: { type: String, required: true },
    state: { type: String },
    budget: { type: Number },
    subscriptionTier: { type: String, enum: ["free", "pro", "enterprise"] as SubscriptionTier[], default: "free" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Organization: Model<IOrganization> = mongoose.models.Organization ?? mongoose.model<IOrganization>("Organization", OrganizationSchema);
