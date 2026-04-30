import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStateRegulatoryProfile {
  state: string;
  stateCode: string;
  
  ceaImplementation: {
    status: 'fully_adopted' | 'partially_adopted' | 'state_own_act' | 'not_applicable';
    authority: string;
    applicationPortal: string;
    processingTimeDays: number;
    fees: {
      min: number;
      max: number;
      currency: string;
    };
    renewalPeriodYears: number;
    requiredDocuments: string[];
    inspectionRequired: boolean;
  };
  
  bmwAuthority: {
    name: string;
    fullName: string;
    regionalOffice: string;
    onlinePortal: string;
    contactDetails: {
      phone: string;
      email: string;
      address: string;
    };
    processingTimeDays: number;
    fees: number;
    renewalPeriodYears: number;
  };
  
  fireAuthority: {
    name: string;
    authority: string;
    onlinePortal: string;
    processingTimeDays: number;
    fees: number;
    renewalPeriodYears: number;
  };
  
  tradeLicenseAuthority: {
    name: string;
    authority: string;
    onlinePortal: string;
    processingTimeDays: number;
    fees: number;
    renewalPeriodYears: number;
  };
  
  districtVariations: Array<{
    district: string;
    districtCode: string;
    specialRules: {
      additionalDocuments: string[];
      modifiedTimelines: {
        cea: number;
        bmw: number;
        fire: number;
        trade: number;
      };
      additionalFees: number;
      specialRequirements: string[];
    };
    localAuthorities: {
      cmo: string;
      municipalCorp: string;
      fireStation: string;
    };
  }>;
  
  cbwtfVendors: Array<{
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    serviceAreas: string[];
    ratePerKg: {
      yellow: number;
      red: number;
      white: number;
      blue: number;
    };
    collectionFrequency: 'daily' | 'alternate_day' | 'weekly' | 'on_demand';
    minimumQuantity: number;
    authorizationNumber: string;
    validUntil: Date;
  }>;
  
  additionalCompliances: Array<{
    name: string;
    description: string;
    authority: string;
    mandatory: boolean;
    applicableLabTypes: string[];
    processingTimeDays: number;
    fees: number;
    requiredDocuments: string[];
  }>;
  
  staffingRequirements: {
    pathologist: {
      mandatory: boolean;
      qualification: string[];
      registrationRequired: string;
      residencyRequired: boolean;
    };
    qualityManager: {
      mandatory: boolean;
      qualification: string[];
      trainingRequired: string;
      certificationRequired: boolean;
    };
    technicians: {
      minimumCount: number;
      qualification: string[];
      registrationRequired: string;
    };
  };
  
  totalSetupTimeline: {
    minimum: number;
    average: number;
    maximum: number;
  };
  
  isActive: boolean;
  lastUpdated: Date;
  updatedBy: string;
}

export interface StateRegulatoryProfileDocument extends IStateRegulatoryProfile, Document {
  getDistrictRules(district: string): any;
  getCBWTFVendors(district: string): any[];
  getEstimatedTimeline(labType: string, district: string): number;
}

const StateRegulatoryProfileSchema = new Schema<StateRegulatoryProfileDocument>({
  state: {
    type: String,
    required: true,
    unique: true,
  },
  stateCode: {
    type: String,
    required: true,
    unique: true
  },
  
  ceaImplementation: {
    status: { 
      type: String, 
      enum: ['fully_adopted', 'partially_adopted', 'state_own_act', 'not_applicable'],
      required: true
    },
    authority: String,
    applicationPortal: String,
    processingTimeDays: { type: Number, default: 60 },
    fees: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' }
    },
    renewalPeriodYears: { type: Number, default: 5 },
    requiredDocuments: [String],
    inspectionRequired: { type: Boolean, default: true }
  },
  
  bmwAuthority: {
    name: String,
    fullName: String,
    regionalOffice: String,
    onlinePortal: String,
    contactDetails: {
      phone: String,
      email: String,
      address: String
    },
    processingTimeDays: { type: Number, default: 45 },
    fees: Number,
    renewalPeriodYears: { type: Number, default: 5 }
  },
  
  fireAuthority: {
    name: String,
    authority: String,
    onlinePortal: String,
    processingTimeDays: { type: Number, default: 30 },
    fees: Number,
    renewalPeriodYears: { type: Number, default: 1 }
  },
  
  tradeLicenseAuthority: {
    name: String,
    authority: String,
    onlinePortal: String,
    processingTimeDays: { type: Number, default: 15 },
    fees: Number,
    renewalPeriodYears: { type: Number, default: 1 }
  },
  
  districtVariations: [{
    district: String,
    districtCode: String,
    specialRules: {
      additionalDocuments: [String],
      modifiedTimelines: {
        cea: Number,
        bmw: Number,
        fire: Number,
        trade: Number
      },
      additionalFees: Number,
      specialRequirements: [String]
    },
    localAuthorities: {
      cmo: String,
      municipalCorp: String,
      fireStation: String
    }
  }],
  
  cbwtfVendors: [{
    name: String,
    contactPerson: String,
    phone: String,
    email: String,
    serviceAreas: [String],
    ratePerKg: {
      yellow: Number,
      red: Number,
      white: Number,
      blue: Number
    },
    collectionFrequency: {
      type: String,
      enum: ['daily', 'alternate_day', 'weekly', 'on_demand']
    },
    minimumQuantity: Number,
    authorizationNumber: String,
    validUntil: Date
  }],
  
  additionalCompliances: [{
    name: String,
    description: String,
    authority: String,
    mandatory: Boolean,
    applicableLabTypes: [String],
    processingTimeDays: Number,
    fees: Number,
    requiredDocuments: [String]
  }],
  
  staffingRequirements: {
    pathologist: {
      mandatory: Boolean,
      qualification: [String],
      registrationRequired: String,
      residencyRequired: Boolean
    },
    qualityManager: {
      mandatory: Boolean,
      qualification: [String],
      trainingRequired: String,
      certificationRequired: Boolean
    },
    technicians: {
      minimumCount: Number,
      qualification: [String],
      registrationRequired: String
    }
  },
  
  totalSetupTimeline: {
    minimum: Number,
    average: Number,
    maximum: Number
  },
  
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  updatedBy: String
}, {
  timestamps: true
});

// Indexes (state is already indexed via `unique: true` on the field)
StateRegulatoryProfileSchema.index({ stateCode: 1 });
StateRegulatoryProfileSchema.index({ 'districtVariations.district': 1 });

// Instance methods
StateRegulatoryProfileSchema.methods.getDistrictRules = function(district: string) {
  const districtVariation = this.districtVariations.find((d: any) => 
    d.district.toLowerCase() === district.toLowerCase()
  );
  
  return districtVariation ? districtVariation.specialRules : null;
};

StateRegulatoryProfileSchema.methods.getCBWTFVendors = function(district: string) {
  return this.cbwtfVendors.filter((vendor: any) => 
    vendor.serviceAreas.includes(district) || 
    vendor.serviceAreas.includes('All')
  );
};

StateRegulatoryProfileSchema.methods.getEstimatedTimeline = function(labType: string, district: string) {
  let baseTimeline = this.totalSetupTimeline.average;
  
  // Adjust for district variations
  const districtRules = this.getDistrictRules(district);
  if (districtRules && districtRules.modifiedTimelines) {
    const maxDistrictTime = Math.max(
      ...Object.values(districtRules.modifiedTimelines)
    );
    baseTimeline = Math.max(baseTimeline, maxDistrictTime);
  }
  
  return baseTimeline;
};

// Static methods
StateRegulatoryProfileSchema.statics.getByState = function(state: string) {
  return this.findOne({ 
    $or: [
      { state: new RegExp(state, 'i') },
      { stateCode: state.toUpperCase() }
    ]
  });
};

StateRegulatoryProfileSchema.statics.getRequiredLicenses = async function(state: string, labType: string) {
  const profile = await this.findOne({ state });
  if (!profile) return [];
  
  const licenses = [
    { type: 'cea_approval', mandatory: profile.ceaImplementation.status !== 'not_applicable' },
    { type: 'bmw_authorization', mandatory: true },
    { type: 'fire_noc', mandatory: true },
    { type: 'trade_license', mandatory: true },
    { type: 'gst_registration', mandatory: true }
  ];
  
  // Add state-specific additional compliances
  profile.additionalCompliances.forEach((compliance: any) => {
    if (compliance.mandatory && 
        (!compliance.applicableLabTypes.length || 
         compliance.applicableLabTypes.includes(labType))) {
      licenses.push({
        type: compliance.name.toLowerCase().replace(/\s+/g, '_'),
        mandatory: true,
        description: compliance.description
      });
    }
  });
  
  return licenses.filter(license => license.mandatory);
};

export const StateRegulatoryProfile: Model<StateRegulatoryProfileDocument> = mongoose.models.StateRegulatoryProfile || mongoose.model<StateRegulatoryProfileDocument>('StateRegulatoryProfile', StateRegulatoryProfileSchema);