import mongoose, { Schema, Document } from 'mongoose';

// --- 1. CORE TENANCY & RBAC ---

export interface IOrganization extends Document {
  name: string;
  slug: string;
  tier: 'free' | 'pro' | 'enterprise';
  settings: {
    currency: string;
    dateFormat: string;
  };
  createdAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  tier: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  settings: {
    currency: { type: String, default: 'INR' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
  },
}, { timestamps: true });

// --- 2. LAB PROFILE (The Physical Entity) ---

export interface ILab extends Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  type: 'collection_center' | 'satellite' | 'processing_hub' | 'reference_lab';
  address: {
    street: string;
    city: string;
    state: string; // Critical for State-specific compliance
    pincode: string;
    geo: { lat: number; lng: number };
  };
  specs: {
    areaSqFt: number;
    isGroundFloor: boolean;
    hasSeparateBMWZone: boolean;
  };
  status: 'planning' | 'construction' | 'operational' | 'audit_mode';
}

const LabSchema = new Schema<ILab>({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['collection_center', 'satellite', 'processing_hub', 'reference_lab'], required: true },
  address: {
    street: String,
    city: { type: String, required: true, index: true },
    state: { type: String, required: true }, // Drives the Compliance Engine
    pincode: String,
    geo: { lat: Number, lng: Number }
  },
  specs: {
    areaSqFt: Number,
    isGroundFloor: Boolean,
    hasSeparateBMWZone: Boolean
  },
  status: { type: String, enum: ['planning', 'construction', 'operational', 'audit_mode'], default: 'planning' }
}, { timestamps: true });

// --- 3. COMPLIANCE & LICENSING ENGINE ---

export interface ILicense extends Document {
  labId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  type: 'CEA' | 'BMW' | 'Fire_NOC' | 'NABL' | 'PC_PNDT' | 'Shop_Est';
  status: 'not_started' | 'drafting' | 'submitted' | 'query_raised' | 'approved' | 'expired';
  authority: string; // e.g., "UP Pollution Control Board"
  applicationNo?: string;
  issueDate?: Date;
  expiryDate?: Date;
  renewalWindowDays: number; // Alert trigger
  documents: {
    name: string;
    url: string;
    uploadedAt: Date;
    tags: string[]; // e.g., ["application_form", "challan"]
  }[];
  auditLog: {
    action: string;
    user: string;
    timestamp: Date;
  }[];
}

const LicenseSchema = new Schema<ILicense>({
  labId: { type: Schema.Types.ObjectId, ref: 'Lab', required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  type: { type: String, required: true, enum: ['CEA', 'BMW', 'Fire_NOC', 'NABL', 'PC_PNDT', 'Shop_Est'] },
  status: { type: String, default: 'not_started' },
  authority: String,
  applicationNo: String,
  issueDate: Date,
  expiryDate: { type: Date, index: true }, // Index for cron jobs
  renewalWindowDays: { type: Number, default: 60 },
  documents: [{
    name: String,
    url: String,
    uploadedAt: Date,
    tags: [String]
  }],
  auditLog: [{
    action: String,
    user: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// --- 4. FINANCIAL ENGINE ---

export interface IFinancialModel extends Document {
  labId: mongoose.Types.ObjectId;
  versionName: string; // e.g., "Conservative Scenario"
  capex: {
    infrastructure: number;
    equipment: number;
    licensing: number;
    marketing_launch: number;
    contingency: number;
  };
  opex: {
    rent: number;
    staff_salaries: number;
    reagent_cost_per_test: number; // Average %
    utilities: number;
    marketing_monthly: number;
  };
  projections: {
    month: number;
    test_volume: number;
    revenue: number;
    cogs: number;
    gross_margin: number;
    net_profit: number;
  }[]; // Array of 24-36 months
  metrics: {
    break_even_month: number;
    roi_3yr: number;
    payback_period_months: number;
  };
}

const FinancialModelSchema = new Schema<IFinancialModel>({
  labId: { type: Schema.Types.ObjectId, ref: 'Lab', required: true },
  versionName: String,
  capex: {
    infrastructure: Number,
    equipment: Number,
    licensing: Number,
    marketing_launch: Number,
    contingency: Number
  },
  opex: {
    rent: Number,
    staff_salaries: Number,
    reagent_cost_per_test: Number,
    utilities: Number,
    marketing_monthly: Number
  },
  projections: [{
    month: Number,
    test_volume: Number,
    revenue: Number,
    cogs: Number,
    gross_margin: Number,
    net_profit: Number
  }],
  metrics: {
    break_even_month: Number,
    roi_3yr: Number,
    payback_period_months: Number
  }
});

export const Organization = mongoose.models.Organization || mongoose.model<IOrganization>('Organization', OrganizationSchema);
export const Lab = mongoose.models.Lab || mongoose.model<ILab>('Lab', LabSchema);
export const License = mongoose.models.License || mongoose.model<ILicense>('License', LicenseSchema);
export const FinancialModel = mongoose.models.FinancialModel || mongoose.model<IFinancialModel>('FinancialModel', FinancialModelSchema);