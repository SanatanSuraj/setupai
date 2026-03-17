import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITenantBranding {
  organizationId: mongoose.Types.ObjectId;
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor?: string;
  accentColor?: string;
  customDomain?: string;
  
  whitelabelConfig: {
    hideSetupAiBranding: boolean;
    customFooter?: string;
    customTermsUrl?: string;
    customPrivacyUrl?: string;
    customSupportEmail?: string;
    customSupportPhone?: string;
  };
  
  emailBranding: {
    fromName: string;
    fromEmail: string;
    replyToEmail?: string;
    emailSignature?: string;
    headerImageUrl?: string;
  };
  
  documentBranding: {
    letterheadUrl?: string;
    watermarkUrl?: string;
    footerText?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  
  features: {
    enabledModules: string[];
    customModuleNames?: Record<string, string>;
    hiddenFeatures?: string[];
    customWorkflows?: Array<{
      name: string;
      steps: string[];
      enabled: boolean;
    }>;
  };
  
  subscription: {
    plan: 'basic' | 'professional' | 'enterprise' | 'white_label';
    maxLabs: number;
    maxUsers: number;
    features: string[];
    customPricing?: {
      setupFee: number;
      monthlyFee: number;
      perLabFee: number;
      perUserFee: number;
    };
  };
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantBrandingDocument extends ITenantBranding, Document {
  getCustomizedConfig(): any;
  isFeatureEnabled(feature: string): boolean;
  getEmailTemplate(type: string): any;
}

const TenantBrandingSchema = new Schema<TenantBrandingDocument>({
  organizationId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Organization',
    required: true, 
    unique: true,
    index: true 
  },
  brandName: { 
    type: String, 
    required: true 
  },
  logoUrl: String,
  faviconUrl: String,
  primaryColor: { 
    type: String, 
    required: true,
    default: '#3B82F6' // Default blue
  },
  secondaryColor: String,
  accentColor: String,
  customDomain: {
    type: String,
    unique: true,
    sparse: true // Allows null values to be non-unique
  },
  
  whitelabelConfig: {
    hideSetupAiBranding: { type: Boolean, default: false },
    customFooter: String,
    customTermsUrl: String,
    customPrivacyUrl: String,
    customSupportEmail: String,
    customSupportPhone: String
  },
  
  emailBranding: {
    fromName: { type: String, required: true },
    fromEmail: { type: String, required: true },
    replyToEmail: String,
    emailSignature: String,
    headerImageUrl: String
  },
  
  documentBranding: {
    letterheadUrl: String,
    watermarkUrl: String,
    footerText: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    email: String,
    website: String
  },
  
  features: {
    enabledModules: {
      type: [String],
      default: [
        'dashboard',
        'roadmap', 
        'licensing',
        'equipment',
        'staff',
        'qc',
        'finance',
        'operations'
      ]
    },
    customModuleNames: {
      type: Map,
      of: String
    },
    hiddenFeatures: [String],
    customWorkflows: [{
      name: String,
      steps: [String],
      enabled: { type: Boolean, default: true }
    }]
  },
  
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'professional', 'enterprise', 'white_label'],
      required: true,
      default: 'basic'
    },
    maxLabs: { type: Number, default: 1 },
    maxUsers: { type: Number, default: 5 },
    features: {
      type: [String],
      default: ['basic_compliance', 'document_generation']
    },
    customPricing: {
      setupFee: Number,
      monthlyFee: Number,
      perLabFee: Number,
      perUserFee: Number
    }
  },
  
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes for performance
TenantBrandingSchema.index({ organizationId: 1 });
TenantBrandingSchema.index({ customDomain: 1 });
TenantBrandingSchema.index({ 'subscription.plan': 1 });

// Instance methods
TenantBrandingSchema.methods.getCustomizedConfig = function() {
  return {
    branding: {
      brandName: this.brandName,
      logoUrl: this.logoUrl,
      primaryColor: this.primaryColor,
      secondaryColor: this.secondaryColor,
      accentColor: this.accentColor,
      hideSetupAiBranding: this.whitelabelConfig.hideSetupAiBranding
    },
    navigation: {
      enabledModules: this.features.enabledModules,
      customModuleNames: this.features.customModuleNames || {},
      hiddenFeatures: this.features.hiddenFeatures || []
    },
    contact: {
      supportEmail: this.whitelabelConfig.customSupportEmail,
      supportPhone: this.whitelabelConfig.customSupportPhone,
      termsUrl: this.whitelabelConfig.customTermsUrl,
      privacyUrl: this.whitelabelConfig.customPrivacyUrl
    },
    subscription: {
      plan: this.subscription.plan,
      features: this.subscription.features,
      limits: {
        maxLabs: this.subscription.maxLabs,
        maxUsers: this.subscription.maxUsers
      }
    }
  };
};

TenantBrandingSchema.methods.isFeatureEnabled = function(feature: string): boolean {
  return this.subscription.features.includes(feature) && 
         !this.features.hiddenFeatures?.includes(feature);
};

TenantBrandingSchema.methods.getEmailTemplate = function(type: string) {
  return {
    fromName: this.emailBranding.fromName,
    fromEmail: this.emailBranding.fromEmail,
    replyTo: this.emailBranding.replyToEmail || this.emailBranding.fromEmail,
    signature: this.emailBranding.emailSignature,
    headerImage: this.emailBranding.headerImageUrl,
    brandName: this.brandName,
    primaryColor: this.primaryColor,
    supportEmail: this.whitelabelConfig.customSupportEmail,
    supportPhone: this.whitelabelConfig.customSupportPhone
  };
};

// Static methods
TenantBrandingSchema.statics.getByDomain = function(domain: string) {
  return this.findOne({ customDomain: domain, isActive: true });
};

TenantBrandingSchema.statics.getByOrganization = function(organizationId: mongoose.Types.ObjectId) {
  return this.findOne({ organizationId, isActive: true });
};

TenantBrandingSchema.statics.createDefaultBranding = async function(organizationId: mongoose.Types.ObjectId, organizationName: string) {
  const defaultBranding = {
    organizationId,
    brandName: organizationName,
    primaryColor: '#3B82F6',
    whitelabelConfig: {
      hideSetupAiBranding: false
    },
    emailBranding: {
      fromName: organizationName,
      fromEmail: `noreply@${organizationName.toLowerCase().replace(/\s+/g, '')}.com`
    },
    features: {
      enabledModules: [
        'dashboard',
        'roadmap', 
        'licensing',
        'equipment',
        'staff',
        'qc',
        'finance',
        'operations'
      ]
    },
    subscription: {
      plan: 'basic',
      maxLabs: 1,
      maxUsers: 5,
      features: ['basic_compliance', 'document_generation']
    }
  };

  return this.create(defaultBranding);
};

export const TenantBranding: Model<TenantBrandingDocument> = mongoose.models.TenantBranding || mongoose.model<TenantBrandingDocument>('TenantBranding', TenantBrandingSchema);