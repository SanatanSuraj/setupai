import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILicense {
  organizationId: mongoose.Types.ObjectId;
  type: string; // e.g., 'BMW', 'CEA', 'Fire NOC', 'Trade License'
  state: string;
  district: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  documents: string[]; // S3/Cloudinary URLs
  expiryDate?: Date;
  approvalDate?: Date;
  notes?: string;
  isHardGate: boolean; // true for BMW, CEA, etc.
  createdAt: Date;
  updatedAt: Date;
}

export interface LicenseDocument extends ILicense, Document {}

const LicenseSchema = new Schema<LicenseDocument>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  type: { type: String, required: true, index: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'submitted', 'approved', 'rejected', 'expired'], 
    default: 'pending',
    index: true 
  },
  documents: [String],
  expiryDate: Date,
  approvalDate: Date,
  notes: String,
  isHardGate: { type: Boolean, default: false },
}, { timestamps: true });

export const License: Model<LicenseDocument> = mongoose.models.License || mongoose.model<LicenseDocument>('License', LicenseSchema);

