import mongoose from 'mongoose';

// Define the schema directly since we can't import TypeScript in .mjs
const StateRegulatoryProfileSchema = new mongoose.Schema({
  state: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
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

const StateRegulatoryProfile = mongoose.models?.StateRegulatoryProfile || mongoose.model('StateRegulatoryProfile', StateRegulatoryProfileSchema);

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/setupai');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// State regulatory profiles based on PDF analysis
const stateProfiles = [
  {
    state: "Uttar Pradesh",
    stateCode: "UP",
    ceaImplementation: {
      status: "partially_adopted",
      authority: "District CMO Office",
      applicationPortal: "UP Health Department Portal",
      processingTimeDays: 75,
      fees: { min: 5000, max: 25000, currency: "INR" },
      renewalPeriodYears: 5,
      requiredDocuments: [
        "Completed Form as prescribed under CEA 2010",
        "Proof of ownership/lease agreement",
        "Floor plan showing laboratory layout",
        "List of services to be offered",
        "Details of pathologist-in-charge and technical staff",
        "Equipment list",
        "Standard Operating Procedures (SOPs)",
        "Biomedical waste management plan"
      ],
      inspectionRequired: true
    },
    bmwAuthority: {
      name: "UPPCB",
      fullName: "Uttar Pradesh Pollution Control Board",
      regionalOffice: "Gautam Buddh Nagar Regional Office",
      onlinePortal: "https://niveshmitra.up.nic.in",
      contactDetails: {
        phone: "+91-120-2511234",
        email: "uppcb.gbn@gov.in",
        address: "Sector 6, Noida, Uttar Pradesh"
      },
      processingTimeDays: 60,
      fees: 15000,
      renewalPeriodYears: 5
    },
    fireAuthority: {
      name: "UP Fire Services",
      authority: "State Fire Department",
      onlinePortal: "https://niveshmitra.up.nic.in",
      processingTimeDays: 30,
      fees: 0,
      renewalPeriodYears: 1
    },
    tradeLicenseAuthority: {
      name: "UP Labour Department",
      authority: "Labour Department, Uttar Pradesh",
      onlinePortal: "https://uplabouracts.in",
      processingTimeDays: 20,
      fees: 5000,
      renewalPeriodYears: 5
    },
    districtVariations: [
      {
        district: "Gautam Buddh Nagar",
        districtCode: "GBN",
        specialRules: {
          additionalDocuments: ["Noida Authority NOC", "Building plan approval"],
          modifiedTimelines: { cea: 90, bmw: 75, fire: 45, trade: 30 },
          additionalFees: 10000,
          specialRequirements: ["NOIDA Authority clearance", "Higher fire safety standards"]
        },
        localAuthorities: {
          cmo: "CMO Gautam Buddh Nagar",
          municipalCorp: "Noida Authority",
          fireStation: "Noida Fire Station"
        }
      }
    ],
    cbwtfVendors: [
      {
        name: "UP Waste Management (UPWMP)",
        contactPerson: "Regional Manager",
        phone: "+91-120-4567890",
        email: "upwmp.noida@gmail.com",
        serviceAreas: ["Gautam Buddh Nagar", "Ghaziabad", "Meerut"],
        ratePerKg: { yellow: 45, red: 35, white: 50, blue: 30 },
        collectionFrequency: "alternate_day",
        minimumQuantity: 5,
        authorizationNumber: "UPPCB/BMW/2024/001",
        validUntil: new Date("2026-12-31")
      }
    ],
    additionalCompliances: [
      {
        name: "Shop & Establishment Registration",
        description: "Mandatory for all commercial establishments",
        authority: "UP Labour Department",
        mandatory: true,
        applicableLabTypes: ["all"],
        processingTimeDays: 15,
        fees: 2000,
        requiredDocuments: ["Application form", "Identity proof", "Address proof"]
      }
    ],
    staffingRequirements: {
      pathologist: {
        mandatory: true,
        qualification: ["MBBS with MD/DNB in Pathology", "MBBS with DCP"],
        registrationRequired: "Uttar Pradesh Medical Council",
        residencyRequired: false
      },
      qualityManager: {
        mandatory: true,
        qualification: ["Graduate in Life Sciences"],
        trainingRequired: "ISO 15189 Training (4-day course)",
        certificationRequired: true
      },
      technicians: {
        minimumCount: 2,
        qualification: ["DMLT", "BMLT", "B.Sc. Medical Laboratory Technology"],
        registrationRequired: "State Medical Council"
      }
    },
    totalSetupTimeline: { minimum: 90, average: 120, maximum: 180 },
    isActive: true,
    updatedBy: "System Seed"
  },
  {
    state: "Maharashtra",
    stateCode: "MH",
    ceaImplementation: {
      status: "partially_adopted",
      authority: "Divisional Offices (Mumbai/Pune/Nagpur)",
      applicationPortal: "Maharashtra Health Department Portal",
      processingTimeDays: 45,
      fees: { min: 10000, max: 50000, currency: "INR" },
      renewalPeriodYears: 3,
      requiredDocuments: [
        "Application form",
        "Layout plan",
        "Equipment list",
        "Staff qualifications",
        "BMW management plan"
      ],
      inspectionRequired: true
    },
    bmwAuthority: {
      name: "MPCB",
      fullName: "Maharashtra Pollution Control Board",
      regionalOffice: "Mumbai Regional Office",
      onlinePortal: "https://mpcb.gov.in",
      contactDetails: {
        phone: "+91-22-24961234",
        email: "mpcb.mumbai@gov.in",
        address: "Kalpataru Point, Mumbai"
      },
      processingTimeDays: 45,
      fees: 20000,
      renewalPeriodYears: 5
    },
    fireAuthority: {
      name: "Maharashtra Fire Services",
      authority: "State Fire Department",
      onlinePortal: "https://maharashtra.gov.in",
      processingTimeDays: 25,
      fees: 5000,
      renewalPeriodYears: 1
    },
    tradeLicenseAuthority: {
      name: "Municipal Corporation",
      authority: "Local Municipal Corporation",
      onlinePortal: "https://mumbai.gov.in",
      processingTimeDays: 15,
      fees: 8000,
      renewalPeriodYears: 1
    },
    districtVariations: [
      {
        district: "Mumbai",
        districtCode: "MUM",
        specialRules: {
          additionalDocuments: ["BMC NOC", "Society NOC"],
          modifiedTimelines: { cea: 60, bmw: 60, fire: 30, trade: 20 },
          additionalFees: 15000,
          specialRequirements: ["BMC zone clearance", "Society permission"]
        },
        localAuthorities: {
          cmo: "Municipal Commissioner Mumbai",
          municipalCorp: "Brihanmumbai Municipal Corporation",
          fireStation: "Mumbai Fire Brigade"
        }
      }
    ],
    cbwtfVendors: [
      {
        name: "Maharashtra Bio-Medical Waste Management",
        contactPerson: "Operations Head",
        phone: "+91-22-28901234",
        email: "mbwm.mumbai@gmail.com",
        serviceAreas: ["Mumbai", "Pune", "Nashik"],
        ratePerKg: { yellow: 50, red: 40, white: 55, blue: 35 },
        collectionFrequency: "daily",
        minimumQuantity: 10,
        authorizationNumber: "MPCB/BMW/2024/001",
        validUntil: new Date("2026-12-31")
      }
    ],
    additionalCompliances: [
      {
        name: "Municipal Corporation License",
        description: "Required for all commercial establishments in municipal areas",
        authority: "Municipal Corporation",
        mandatory: true,
        applicableLabTypes: ["all"],
        processingTimeDays: 20,
        fees: 5000,
        requiredDocuments: ["Application", "Property documents", "NOC from society"]
      }
    ],
    staffingRequirements: {
      pathologist: {
        mandatory: true,
        qualification: ["MBBS with MD/DNB in Pathology"],
        registrationRequired: "Maharashtra Medical Council",
        residencyRequired: false
      },
      qualityManager: {
        mandatory: true,
        qualification: ["Graduate in Life Sciences", "ISO 15189 Training"],
        trainingRequired: "ISO 15189 Training",
        certificationRequired: true
      },
      technicians: {
        minimumCount: 2,
        qualification: ["DMLT", "BMLT"],
        registrationRequired: "Maharashtra Medical Council"
      }
    },
    totalSetupTimeline: { minimum: 75, average: 105, maximum: 150 },
    isActive: true,
    updatedBy: "System Seed"
  },
  {
    state: "Karnataka",
    stateCode: "KA",
    ceaImplementation: {
      status: "fully_adopted",
      authority: "BBMP / District DHO",
      applicationPortal: "Karnataka Health Department Portal",
      processingTimeDays: 40,
      fees: { min: 8000, max: 40000, currency: "INR" },
      renewalPeriodYears: 5,
      requiredDocuments: [
        "Application form",
        "Layout plan with zoning",
        "Equipment specifications",
        "Staff credentials",
        "BMW authorization"
      ],
      inspectionRequired: true
    },
    bmwAuthority: {
      name: "KSPCB",
      fullName: "Karnataka State Pollution Control Board",
      regionalOffice: "Bangalore Regional Office",
      onlinePortal: "https://kspcb.gov.in",
      contactDetails: {
        phone: "+91-80-25589123",
        email: "kspcb.bangalore@gov.in",
        address: "Parisara Bhavan, Bangalore"
      },
      processingTimeDays: 35,
      fees: 18000,
      renewalPeriodYears: 5
    },
    fireAuthority: {
      name: "Karnataka Fire Services",
      authority: "State Fire & Emergency Services",
      onlinePortal: "https://ksfes.gov.in",
      processingTimeDays: 20,
      fees: 3000,
      renewalPeriodYears: 1
    },
    tradeLicenseAuthority: {
      name: "BBMP/Municipal Council",
      authority: "Local Municipal Authority",
      onlinePortal: "https://bbmp.gov.in",
      processingTimeDays: 10,
      fees: 6000,
      renewalPeriodYears: 1
    },
    districtVariations: [],
    cbwtfVendors: [
      {
        name: "Karnataka Bio-Medical Waste Solutions",
        contactPerson: "Regional Manager",
        phone: "+91-80-40123456",
        email: "kbws.bangalore@gmail.com",
        serviceAreas: ["Bangalore Urban", "Bangalore Rural", "Mysore"],
        ratePerKg: { yellow: 48, red: 38, white: 53, blue: 33 },
        collectionFrequency: "daily",
        minimumQuantity: 8,
        authorizationNumber: "KSPCB/BMW/2024/001",
        validUntil: new Date("2026-12-31")
      }
    ],
    additionalCompliances: [],
    staffingRequirements: {
      pathologist: {
        mandatory: true,
        qualification: ["MBBS with MD/DNB in Pathology"],
        registrationRequired: "Karnataka Medical Council",
        residencyRequired: false
      },
      qualityManager: {
        mandatory: true,
        qualification: ["Graduate in Life Sciences"],
        trainingRequired: "ISO 15189 Training",
        certificationRequired: true
      },
      technicians: {
        minimumCount: 2,
        qualification: ["DMLT", "BMLT"],
        registrationRequired: "Karnataka Medical Council"
      }
    },
    totalSetupTimeline: { minimum: 60, average: 90, maximum: 120 },
    isActive: true,
    updatedBy: "System Seed"
  }
];

async function seedRegulatoryProfiles() {
  try {
    await connectDB();
    
    console.log('Seeding state regulatory profiles...');
    
    for (const profile of stateProfiles) {
      await StateRegulatoryProfile.findOneAndUpdate(
        { state: profile.state },
        profile,
        { upsert: true, new: true }
      );
      console.log(`✓ Seeded ${profile.state} regulatory profile`);
    }
    
    console.log('State regulatory profiles seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding regulatory profiles:', error);
    process.exit(1);
  }
}

seedRegulatoryProfiles();