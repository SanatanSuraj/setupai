import mongoose, { Schema, Model } from "mongoose";
import type { IOrganization, LabType, SubscriptionTier } from "@/types";
import { auditPlugin } from "@/lib/mongoose-plugins";

const OrganizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    labType: { type: String, enum: ["basic", "medium", "advanced", "clinic_lab"] as LabType[] },
    city: { type: String, default: "" },
    state: { type: String },
    budget: { type: Number },
    subscriptionTier: { type: String, enum: ["free", "pro", "enterprise"] as SubscriptionTier[], default: "free" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

OrganizationSchema.plugin(auditPlugin);

export const Organization: Model<IOrganization> = mongoose.models.Organization ?? mongoose.model<IOrganization>("Organization", OrganizationSchema);
