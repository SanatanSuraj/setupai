import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEquipment {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  category: string; // 'hematology', 'biochemistry', 'ecg', etc.
  vendor: string;
  price: number;
  status: 'planning' | 'ordered' | 'delivered' | 'installed' | 'integrated';
  deliveryDate?: Date;
  specs: {
    power: number;
    footprint: number;
    amcCost: number;
  };
}

export interface EquipmentDocument extends IEquipment, Document {}

const EquipmentSchema = new Schema<EquipmentDocument>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  vendor: String,
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['planning', 'ordered', 'delivered', 'installed', 'integrated'],
    default: 'planning' 
  },
  deliveryDate: Date,
  specs: {
    power: Number,
    footprint: Number,
    amcCost: Number,
  },
}, { timestamps: true });

export const Equipment: Model<EquipmentDocument> = mongoose.models.Equipment || mongoose.model<EquipmentDocument>('Equipment', EquipmentSchema);

