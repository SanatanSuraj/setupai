import mongoose, { Schema, Model } from "mongoose";
import type { IEquipment } from "@/types";

const EquipmentSchema = new Schema<IEquipment>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    capex: { type: Number, required: true },
    maintenanceCost: { type: Number },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Equipment: Model<IEquipment> = mongoose.models.Equipment ?? mongoose.model<IEquipment>("Equipment", EquipmentSchema);
