import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStaff {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  role: 'pathologist' | 'technician' | 'phlebotomist' | 'receptionist' | 'manager';
  qualification: string;
  salary: number;
  trainingStatus: 'pending' | 'in-progress' | 'certified' | 'expired';
  trainingModules: string[];
  joinedDate: Date;
  isMandatory: boolean;
}

export interface StaffDocument extends IStaff, Document {}

const StaffSchema = new Schema<StaffDocument>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['pathologist', 'technician', 'phlebotomist', 'receptionist', 'manager'],
    required: true 
  },
  qualification: String,
  salary: Number,
  trainingStatus: { 
    type: String, 
    enum: ['pending', 'in-progress', 'certified', 'expired'],
    default: 'pending' 
  },
  trainingModules: [String],
  joinedDate: { type: Date, default: Date.now },
  isMandatory: { type: Boolean, default: false },
}, { timestamps: true });

export const Staff: Model<StaffDocument> = mongoose.models.Staff || mongoose.model<StaffDocument>('Staff', StaffSchema);

