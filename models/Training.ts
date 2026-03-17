import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITraining {
  organizationId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  module: string; // e.g., 'Device Operation', 'BMW Compliance'
  role: string;
  status: 'pending' | 'started' | 'completed' | 'failed';
  score?: number;
  completedAt?: Date;
}

export interface TrainingDocument extends ITraining, Document {}

const TrainingSchema = new Schema<TrainingDocument>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'Staff', required: true },
  module: { type: String, required: true },
  role: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'started', 'completed', 'failed'],
    default: 'pending' 
  },
  score: Number,
  completedAt: Date,
}, { timestamps: true });

export const Training: Model<TrainingDocument> = mongoose.models.Training || mongoose.model<TrainingDocument>('Training', TrainingSchema);

