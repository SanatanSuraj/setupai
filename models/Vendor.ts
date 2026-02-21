import mongoose, { Schema, Model } from "mongoose";
import type { IVendor } from "@/types";

const VendorSchema = new Schema<IVendor>(
  {
    name: { type: String, required: true },
    contact: { type: String },
    email: { type: String },
    category: { type: String },
  },
  { timestamps: true }
);

export const Vendor: Model<IVendor> = mongoose.models.Vendor ?? mongoose.model<IVendor>("Vendor", VendorSchema);
