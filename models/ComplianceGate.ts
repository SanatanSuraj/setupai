import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComplianceGate {
  organizationId: mongoose.Types.ObjectId;
  gateType: 'bmw_authorization' | 'cea_approval' | 'fire_noc' | 'nabl_readiness' | 'trade_license' | 'gst_registration' | 'shop_establishment' | 'pollution_control';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'expired';
  hardGate: boolean;
  stateSpecificRules?: any;
  enforcementActions: {
    blockPhaseProgression: boolean;
    blockGoLive: boolean;
    generateAlert: boolean;
  };
  documents: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
    validatedAt?: Date;
    aiValidationStatus: 'pending' | 'valid' | 'invalid' | 'requires_review';
  }>;
  applicationDetails: {
    applicationNumber?: string;
    submittedDate?: Date;
    approvalDate?: Date;
    expiryDate?: Date;
    renewalDue?: Date;
    authority?: string;
    fees?: number;
  };
  blockingReason?: string;
  actionRequired?: string;
  lastUpdated: Date;
  alerts: Array<{
    type: 'renewal_due' | 'expired' | 'missing_document' | 'validation_failed';
    message: string;
    createdAt: Date;
    acknowledged: boolean;
  }>;
}

export interface ComplianceGateDocument extends IComplianceGate, Document {
  isExpired(): boolean;
  isRenewalDue(): boolean;
  canProceed(): boolean;
}

const ComplianceGateSchema = new Schema<ComplianceGateDocument>({
  organizationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization',
    required: true, 
    index: true 
  },
  gateType: { 
    type: String, 
    enum: [
      'bmw_authorization', 
      'cea_approval', 
      'fire_noc', 
      'nabl_readiness',
      'trade_license',
      'gst_registration',
      'shop_establishment',
      'pollution_control'
    ],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'approved', 'rejected', 'expired'],
    default: 'pending' 
  },
  hardGate: { 
    type: Boolean, 
    default: false 
  },
  stateSpecificRules: { 
    type: Schema.Types.Mixed 
  },
  enforcementActions: {
    blockPhaseProgression: { type: Boolean, default: false },
    blockGoLive: { type: Boolean, default: false },
    generateAlert: { type: Boolean, default: true }
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now },
    validatedAt: Date,
    aiValidationStatus: {
      type: String,
      enum: ['pending', 'valid', 'invalid', 'requires_review'],
      default: 'pending'
    }
  }],
  applicationDetails: {
    applicationNumber: String,
    submittedDate: Date,
    approvalDate: Date,
    expiryDate: Date,
    renewalDue: Date,
    authority: String,
    fees: Number
  },
  blockingReason: String,
  actionRequired: String,
  lastUpdated: { type: Date, default: Date.now },
  alerts: [{
    type: {
      type: String,
      enum: ['renewal_due', 'expired', 'missing_document', 'validation_failed']
    },
    message: String,
    createdAt: { type: Date, default: Date.now },
    acknowledged: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Indexes for performance
ComplianceGateSchema.index({ organizationId: 1, gateType: 1 }, { unique: true });
ComplianceGateSchema.index({ status: 1 });
ComplianceGateSchema.index({ hardGate: 1 });
ComplianceGateSchema.index({ 'applicationDetails.expiryDate': 1 });

// Pre-save middleware for BMW hard gate enforcement
ComplianceGateSchema.pre('save', function(next) {
  if (this.gateType === 'bmw_authorization') {
    this.hardGate = true;
    this.enforcementActions.blockGoLive = true;
  }
  
  // Set renewal alerts
  if (this.applicationDetails.expiryDate) {
    const expiryDate = new Date(this.applicationDetails.expiryDate);
    const renewalDate = new Date(expiryDate);
    renewalDate.setDate(renewalDate.getDate() - 30); // 30 days before expiry
    this.applicationDetails.renewalDue = renewalDate;
  }
  
  next();
});

// Instance methods
ComplianceGateSchema.methods.isExpired = function() {
  if (!this.applicationDetails.expiryDate) return false;
  return new Date() > new Date(this.applicationDetails.expiryDate);
};

ComplianceGateSchema.methods.isRenewalDue = function() {
  if (!this.applicationDetails.renewalDue) return false;
  return new Date() >= new Date(this.applicationDetails.renewalDue);
};

ComplianceGateSchema.methods.canProceed = function() {
  if (this.hardGate && this.status !== 'approved') return false;
  if (this.isExpired()) return false;
  return true;
};

// Static methods
ComplianceGateSchema.statics.getBlockingGates = function(organizationId: mongoose.Types.ObjectId) {
  return this.find({
    organizationId,
    hardGate: true,
    status: { $ne: 'approved' }
  });
};

ComplianceGateSchema.statics.checkGoLiveReadiness = async function(organizationId: mongoose.Types.ObjectId) {
  const hardGates = await this.find({
    organizationId,
    hardGate: true
  });
  
  const blockers = hardGates.filter((gate: any) => !gate.canProceed());
  const completedGates = hardGates.filter((gate: any) => gate.status === 'approved');
  
  return {
    canGoLive: blockers.length === 0,
    totalGates: hardGates.length,
    completedGates: completedGates.length,
    completionPercentage: hardGates.length > 0 ? (completedGates.length / hardGates.length) * 100 : 0,
    blockers: blockers.map((gate: any) => ({
      gateType: gate.gateType,
      status: gate.status,
      reason: gate.blockingReason,
      actionRequired: gate.actionRequired
    }))
  };
};

ComplianceGateSchema.statics.initializeStateGates = async function(organizationId: mongoose.Types.ObjectId, state: string) {
  // This will be populated based on StateRegulatoryProfile
  const defaultGates = [
    { gateType: 'bmw_authorization', hardGate: true },
    { gateType: 'cea_approval', hardGate: true },
    { gateType: 'fire_noc', hardGate: true },
    { gateType: 'trade_license', hardGate: true },
    { gateType: 'gst_registration', hardGate: false }
  ];
  
  for (const gateData of defaultGates) {
    await this.findOneAndUpdate(
      { organizationId, gateType: gateData.gateType },
      { ...gateData, organizationId },
      { upsert: true, new: true }
    );
  }
};

export const ComplianceGate: Model<ComplianceGateDocument> = mongoose.models.ComplianceGate || mongoose.model<ComplianceGateDocument>('ComplianceGate', ComplianceGateSchema);