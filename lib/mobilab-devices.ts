/**
 * Mobilab device catalog – full details for equipment showcase & detail pages.
 * Data sourced from Mobilab Duo User Manual and Mobilab CBC Maintenance Manual.
 */

export interface MobilabDevice {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  images: string[];
  price?: string;
  priceNote?: string;
  certifications: string[];
  specifications: Record<string, string>;
  description: string;
  features: string[];
  components: { name: string; description: string }[];
  manufacturer?: string;
  support?: { email: string; phone: string; website: string };
}

export const MOBILAB_DEVICES: MobilabDevice[] = [
  {
    id: "mobilab-duo",
    slug: "mobilab-duo",
    name: "Mobilab Duo",
    shortDescription: "Portable blood testing device for point-of-care diagnostics.",
    images: ["/equipment/mobilab-duo.jpg"],
    price: "Contact for pricing",
    priceNote: "Pre-negotiated rates for MobiLab partners.",
    certifications: ["CDSCO Licensed", "ISO 13485", "ISO 9001", "Clinically validated (GMCH, GNRC)"],
    specifications: {
      "Brand Name": "Mobilab",
      "Device Name": "Mobilab Duo",
      "Description": "Portable Blood Testing Device",
      "Power": "Battery Powered",
      "Battery Capacity": "7500 mAh",
      "Battery Backup": "4–5 hrs",
      "Operating Temperature": "10°–35°C",
      "Dimensions": "560 × 355 × 230 mm",
      "Weight": "6.6 kg",
      "Input Supply": "100–240V, 50–60 Hz",
      "Output Supply": "12.6V",
      "Connectivity": "Wired (OTG)",
      "Languages": "Multilingual",
      "Warranty": "One year",
      "IP Rating": "IP32",
      "Test Capacity": "Up to 1000 tests per charge",
    },
    description:
      "Mobilab Duo is a compact and portable diagnostic device developed to support healthcare professionals with rapid and accurate testing at the point of care. Designed for use in diverse healthcare environments—including clinics, mobile health camps, emergency settings, and remote areas—Mobilab Duo enables timely decision-making by delivering reliable results within minutes. Its user-friendly interface, robust design, and broad test menu make it a valuable tool for enhancing diagnostic efficiency and accessibility, especially in resource-constrained settings.",
    features: [
      "All-in-One Solution: Integrates multiple diagnostic tools into a single, compact unit.",
      "Compact and Portable: Lightweight case with secure compartments for each component.",
      "Rapid Diagnostics: Delivers test results in minutes for critical decision-making.",
      "Easy Setup: Integrated instruction panel for quick setup in remote locations.",
      "Smartphone Integration: Mobilab Connect app controls the analyzer and manages results.",
      "Durable and Secure: Built to protect equipment during transportation.",
      "Data Management: Built-in memory with options for data export.",
      "25+ Clinical Parameters: Kidney, Liver, Cardiovascular, Thyroid, Diabetes, Anemia.",
    ],
    components: [
      {
        name: "Mobilab Analyzer",
        description:
          "Portable blood testing device that connects to a phone via OTG cable. Tests over 25 vital parameters for diagnosing diseases related to heart, liver, kidneys, and blood.",
      },
      {
        name: "Mobifuge",
        description:
          "Compact, battery-operated centrifuge designed to efficiently separate components in blood before testing.",
      },
      {
        name: "Mobimix",
        description:
          "Compact and portable mixer for uniform mixing of reagents and samples, crucial for accurate testing.",
      },
      {
        name: "Mobicube",
        description:
          "Portable incubator that maintains a precise 37°C, optimizing chemical reactions for accurate results.",
      },
      {
        name: "Micropipettes",
        description:
          "Precision instruments for liquid handling with adjustable volumes for various test requirements.",
      },
    ],
    manufacturer: "Primary Healthtech Private Limited",
    support: {
      email: "support@mobilab.in",
      phone: "+91-7042750444",
      website: "www.mobilab.in",
    },
  },
  {
    id: "cbc-analyzer",
    slug: "cbc-analyzer",
    name: "Mobilab CBC",
    shortDescription: "3-part automated hematology analyzer with 20 parameters.",
    images: ["/equipment/cbc-analyzer.jpg"],
    price: "Contact for pricing",
    priceNote: "Pre-negotiated rates for MobiLab partners.",
    certifications: ["CDSCO Licensed", "ISO 13485", "ISO 9001", "Manufactured by Primary Healthtech"],
    specifications: {
      "Model": "Mobilab CBC",
      "Type": "3-part Hematology Analyzer",
      "Theory": "Resistance method + colorimetric method (HGB)",
      "Test Speed": "60 T/H",
      "Parameters": "20 parameters, 3 histograms (WBC, RBC, PLT)",
      "Sample Volume": "Whole blood: 9.8 µL; Pre-dilution: 20 µL",
      "Supply Voltage": "AC 220V ± 22V, 50Hz ± 1Hz",
      "Rated Power": "≤ 200 VA",
      "Operating Temperature": "15°C–35°C",
      "Relative Humidity": "10%–90%",
      "Dimensions": "270 × 490 × 390 mm (W × D × H)",
      "Weight": "≤ 21 kg",
      "Display": "10.4″ Color LCD + touch screen",
      "Printer": "Internal thermal printer, external printer supported",
      "Counting Micropore": "WBC: 80 µm, RBC: 50 µm",
      "Expected Service Life": "8 years",
    },
    description:
      "Mobilab CBC is an automated hematology analyzer using electrical impedance for cell counting and colorimetry for hemoglobin measurement. It is suitable for the determination of whole blood count, white blood cell tripartite, and hemoglobin concentration in clinical examination, providing 20 blood parameters and 3 histograms. The analyzer features a sampling probe assembly, dilution device, counting chamber, and HGB detection unit for comprehensive CBC analysis.",
    features: [
      "20 parameters including WBC, RBC, HGB, HCT, MCV, MCH, MCHC, PLT.",
      "3 histograms: WBC, RBC, PLT.",
      "3-part differential from WBC histogram (LYM#, MID#, GRA#).",
      "60 tests per hour throughput.",
      "Open sampling model with whole blood and pre-dilution modes.",
      "Internal thermal printer and LIS connectivity (RS232, LAN, USB).",
      "RFID support for reagent management.",
    ],
    components: [
      {
        name: "Counting Chamber Assembly",
        description:
          "Detection unit with RBC counting cell, WBC counting cell, HGB detection unit, and isolation chamber.",
      },
      {
        name: "Sampling Probe Assembly",
        description:
          "Sampling needle, swab, horizontal/vertical stepper motors, and sensors for sample handling.",
      },
      {
        name: "Syringe Assembly",
        description:
          "Triple syringe: diluent syringe, hemolysis syringe, and sample syringe with transmission mechanism.",
      },
      {
        name: "Pump & Solenoid Valves",
        description:
          "Waste liquid pump and solenoid valve assembly for reagent flow and mixing.",
      },
    ],
    manufacturer: "Primary Healthtech Private Limited",
    support: {
      email: "support@mobilab.in",
      phone: "+91-7042750444",
      website: "www.mobilab.in",
    },
  },
  {
    id: "fia-analyzer",
    slug: "fia-analyzer",
    name: "FIA Analyzer",
    shortDescription: "Flow Injection Analysis for immunoassay and chemistry testing.",
    images: ["/equipment/fia-analyzer.jpg"],
    price: "Contact for pricing",
    certifications: ["CDSCO", "ISO 13485"],
    specifications: {
      "Type": "Flow Injection Analysis",
      "Status": "Details coming soon",
    },
    description:
      "Mobilab FIA Analyzer for flow injection-based immunoassay and clinical chemistry testing. Full specifications and details to be added.",
    features: ["Flow injection technology", "Immunoassay capability", "Compact design"],
    components: [],
    support: {
      email: "support@mobilab.in",
      phone: "+91-7042750444",
      website: "www.mobilab.in",
    },
  },
  {
    id: "electrolytes-analyzer",
    slug: "electrolytes-analyzer",
    name: "Electrolytes Analyzer",
    shortDescription: "Ion-selective electrode (ISE) based electrolyte analysis.",
    images: ["/equipment/electrolytes-analyzer.jpg"],
    price: "Contact for pricing",
    certifications: ["CDSCO", "ISO 13485"],
    specifications: {
      "Type": "Electrolyte Analyzer",
      "Status": "Details coming soon",
    },
    description:
      "Mobilab Electrolytes Analyzer for rapid measurement of Na+, K+, Cl−, and related electrolytes. Full specifications and details to be added.",
    features: ["ISE technology", "Fast results", "Minimal sample volume"],
    components: [],
    support: {
      email: "support@mobilab.in",
      phone: "+91-7042750444",
      website: "www.mobilab.in",
    },
  },
  {
    id: "ecg",
    slug: "ecg",
    name: "ECG",
    shortDescription: "Portable ECG for cardiac monitoring and diagnostics.",
    images: ["/equipment/ecg.jpg"],
    price: "Contact for pricing",
    certifications: ["CDSCO", "ISO 13485"],
    specifications: {
      "Type": "ECG",
      "Status": "Details coming soon",
    },
    description:
      "Mobilab ECG device for portable cardiac monitoring and diagnostics. Full specifications and details to be added.",
    features: ["Portable design", "Multi-lead support", "Digital output"],
    components: [],
    support: {
      email: "support@mobilab.in",
      phone: "+91-7042750444",
      website: "www.mobilab.in",
    },
  },
];

export function getDeviceBySlug(slug: string): MobilabDevice | undefined {
  return MOBILAB_DEVICES.find((d) => d.slug === slug);
}

export function getAllDeviceSlugs(): string[] {
  return MOBILAB_DEVICES.map((d) => d.slug);
}
