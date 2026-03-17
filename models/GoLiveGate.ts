import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoLiveGate {
  organizationId: mongoose.Types.ObjectId;
  name: string; // e.g., 'BMW Registration', 'Staff Training Complete'
  status: 'pending' | 'passed' | 'failed';
  isHardGate: boolean;
  gateType: 'bmw_authorization' | 'cea_approval' | 'fire_noc' | 'staff_training' | 'equipment_calibration' | 'nabl_readiness' | 'lims_integration' | 'pathologist_onboard' | 'quality_manual' | 'internal_audit' | 'sample_collection_sops' | 'insurance_policies' | 'other';
  details?: any;
  
  // BMW-specific fields
  bmwValidation?: {
    authorizationStatus: 'not_applied' | 'applied' | 'approved' | 'expired';
    cbwtfContract?: {
      vendorName: string;
      contractNumber: string;
      signedDate: Date;
      documentUrl: string;
    };
    hardGateEnforcement: boolean;
  };
  
  // Document validation
  documents?: Array<{
    name: string;
    url: string;
    uploadedAt: Date;
    validatedAt?: Date;
    aiValidationStatus: 'pending' | 'valid' | 'invalid' | 'requires_review';
  }>;
  
  // Blocking information
  blockingReason?: string;
  actionRequired?: string;
  
  updatedAt: Date;
}

export interface GoLiveGateDocument extends IGoLiveGate, Document {}

const GoLiveGateSchema = new Schema<GoLiveGateDocument>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'passed', 'failed'],
    default: 'pending',
    index: true 
  },
  isHardGate: { type: Boolean, default: false },
  gateType: {
    type: String,
    enum: ['bmw_authorization', 'cea_approval', 'fire_noc', 'staff_training', 'equipment_calibration', 'nabl_readiness', 'lims_integration', 'pathologist_onboard', 'quality_manual', 'internal_audit', 'sample_collection_sops', 'insurance_policies', 'other'],
    required: true,
    index: true
  },
  details: mongoose.Schema.Types.Mixed,
  
  // BMW-specific validation
  bmwValidation: {
    authorizationStatus: { 
      type: String, 
      enum: ['not_applied', 'applied', 'approved', 'expired'],
      default: 'not_applied'
    },
    cbwtfContract: {
      vendorName: String,
      contractNumber: String,
      signedDate: Date,
      documentUrl: String
    },
    hardGateEnforcement: {
      type: Boolean,
      default: function() {
        return this.gateType === 'bmw_authorization';
      }
    }
  },
  
  // Document validation
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
  
  // Blocking information
  blockingReason: String,
  actionRequired: String
}, { timestamps: true });

// Pre-save middleware for BMW hard gate enforcement
GoLiveGateSchema.pre('save', function(next) {
  if (this.gateType === 'bmw_authorization') {
    this.isHardGate = true;
    if (this.bmwValidation) {
      this.bmwValidation.hardGateEnforcement = true;
    }
  }
  
  // Auto-set blocking information for hard gates
  if (this.isHardGate && this.status !== 'passed') {
    if (this.gateType === 'bmw_authorization') {
      this.blockingReason = 'BMW authorization must be approved before go-live';
      this.actionRequired = 'Complete BMW authorization application and obtain approval from State Pollution Control Board';
    }
  }
  
  next();
});

// Instance methods
GoLiveGateSchema.methods.canProceed = function() {
  if (this.isHardGate && this.status !== 'passed') return false;
  if (this.gateType === 'bmw_authorization' && this.bmwValidation) {
    return this.bmwValidation.authorizationStatus === 'approved';
  }
  return this.status === 'passed';
};

GoLiveGateSchema.methods.isBMWExpired = function() {
  if (this.gateType !== 'bmw_authorization' || !this.bmwValidation) return false;
  return this.bmwValidation.authorizationStatus === 'expired';
};

// Static methods
GoLiveGateSchema.statics.checkGoLiveReadiness = async function(organizationId: mongoose.Types.ObjectId) {
  const gates = await this.find({ organizationId });
  const hardGates = gates.filter((gate: any) => gate.isHardGate);
  const blockers = hardGates.filter((gate: any) => !gate.canProceed());
  const passedGates = gates.filter((gate: any) => gate.status === 'passed');
  
  return {
    canGoLive: blockers.length === 0,
    totalGates: gates.length,
    hardGates: hardGates.length,
    passedGates: passedGates.length,
    completionPercentage: gates.length > 0 ? (passedGates.length / gates.length) * 100 : 0,
    blockers: blockers.map((gate: any) => ({
      name: gate.name,
      gateType: gate.gateType,
      status: gate.status,
      reason: gate.blockingReason,
      actionRequired: gate.actionRequired
    }))
  };
};

GoLiveGateSchema.statics.initializeDefaultGates = async function(organizationId: mongoose.Types.ObjectId) {
  const defaultGates = [
    { name: 'BMW Authorization Approved', gateType: 'bmw_authorization', isHardGate: true },
    { name: 'CEA Registration Complete', gateType: 'cea_approval', isHardGate: true },
    { name: 'Fire NOC Obtained', gateType: 'fire_noc', isHardGate: true },
    { name: 'Staff Training Certified', gateType: 'staff_training', isHardGate: true },
    { name: 'Equipment Calibrated', gateType: 'equipment_calibration', isHardGate: true },
    { name: 'LIMS Integration Tested', gateType: 'lims_integration', isHardGate: true },
    { name: 'Pathologist Onboarded', gateType: 'pathologist_onboard', isHardGate: true },
    { name: 'Quality Manual Approved', gateType: 'quality_manual', isHardGate: false },
    { name: 'Internal Audit Completed', gateType: 'internal_audit', isHardGate: false },
    { name: 'Sample Collection SOPs', gateType: 'sample_collection_sops', isHardGate: true },
    { name: 'Insurance Policies Active', gateType: 'insurance_policies', isHardGate: false },
    { name: 'NABL Readiness Assessment', gateType: 'nabl_readiness', isHardGate: false }
  ];
  
  for (const gateData of defaultGates) {
    await this.findOneAndUpdate(
      { organizationId, gateType: gateData.gateType },
      { ...gateData, organizationId },
      { upsert: true, new: true }
    );
  }
};

export const GoLiveGate: Model<GoLiveGateDocument> = mongoose.models.GoLiveGate || mongoose.model<GoLiveGateDocument>('GoLiveGate', GoLiveGateSchema);

