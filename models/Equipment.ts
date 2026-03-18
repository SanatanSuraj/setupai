import mongoose, { Schema, Document, Model } from "mongoose";
import { auditPlugin } from "@/lib/mongoose-plugins";

export interface IEquipment {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  // capex / maintenanceCost are the API-facing names (price alias kept for backwards compat)
  capex: number;
  maintenanceCost?: number;
  vendorId?: mongoose.Types.ObjectId;
  vendor?: string;          // free-text vendor name (optional, alternative to vendorId)
  status: 'planning' | 'ordered' | 'delivered' | 'installed' | 'integrated';
  deliveryDate?: Date;
  specs?: {
    power?: number;
    footprint?: number;
    amcCost?: number;
  };
}

export interface EquipmentDocument extends IEquipment, Document {}

const EquipmentSchema = new Schema<EquipmentDocument>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name:     { type: String, required: true },
    category: { type: String, required: true },
    capex:    { type: Number, required: true, default: 0 },
    maintenanceCost: { type: Number, default: 0 },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    vendor:   { type: String },
    status: {
      type: String,
      enum: ['planning', 'ordered', 'delivered', 'installed', 'integrated'],
      default: 'planning',
    },
    deliveryDate: Date,
    specs: {
      power:     Number,
      footprint: Number,
      amcCost:   Number,
    },
  },
  { timestamps: true }
);

EquipmentSchema.plugin(auditPlugin);

export const Equipment: Model<EquipmentDocument> =
  mongoose.models.Equipment ||
  mongoose.model<EquipmentDocument>("Equipment", EquipmentSchema);
