/**
 * License catalog for the Licensing & Compliance module.
 * Defines available license types with descriptions, categories, and metadata for browsing.
 */

export type LicenseCategory = "mandatory" | "optional" | "accreditation";

export interface LicenseCatalogItem {
  id: string;
  name: string;
  shortDescription: string;
  keyRequirements: string[];
  authority: string;
  category: LicenseCategory;
  avgApprovalDays: number;
  isHardGate: boolean;
}

export const LICENSE_CATALOG: LicenseCatalogItem[] = [
  {
    id: "cea",
    name: "Clinical Establishment Registration",
    shortDescription: "Mandatory registration under the Clinical Establishments Act for operating a diagnostic lab or clinic.",
    keyRequirements: ["Proof of ownership/rent", "Layout plan", "Fire NOC", "Staff qualifications", "Equipment list"],
    authority: "District Health Office",
    category: "mandatory",
    avgApprovalDays: 30,
    isHardGate: true,
  },
  {
    id: "bmw",
    name: "Biomedical Waste (BMW) Authorization",
    shortDescription: "Authorization from the pollution control board for handling and disposing biomedical waste.",
    keyRequirements: ["CBWTF agreement", "Consent to establish", "Waste management plan"],
    authority: "State Pollution Control Board",
    category: "mandatory",
    avgApprovalDays: 45,
    isHardGate: true,
  },
  {
    id: "fire",
    name: "Fire Safety NOC",
    shortDescription: "No Objection Certificate from the fire department certifying building safety compliance.",
    keyRequirements: ["Building plan approval", "Fire extinguisher invoice", "Electrical safety certificate"],
    authority: "Fire Department",
    category: "mandatory",
    avgApprovalDays: 21,
    isHardGate: true,
  },
  {
    id: "trade",
    name: "Trade License",
    shortDescription: "Municipal license to legally operate a clinical lab or diagnostic centre as a trade.",
    keyRequirements: ["Occupancy certificate", "Property tax receipt", "ID proof of owner"],
    authority: "Municipal Corporation",
    category: "mandatory",
    avgApprovalDays: 14,
    isHardGate: true,
  },
  {
    id: "gst",
    name: "GST Registration",
    shortDescription: "Goods and Services Tax registration for taxable diagnostic and lab services.",
    keyRequirements: ["PAN card", "Incorporation certificate", "Address proof", "Bank details"],
    authority: "GST Portal",
    category: "mandatory",
    avgApprovalDays: 7,
    isHardGate: false,
  },
  {
    id: "pollution",
    name: "Pollution Control Board Consent",
    shortDescription: "Consent for establishment and operation under Water and Air Acts for lab operations.",
    keyRequirements: ["Site plan", "Water consumption details", "BMW authorization copy"],
    authority: "State Pollution Control Board",
    category: "mandatory",
    avgApprovalDays: 60,
    isHardGate: false,
  },
  {
    id: "nabl",
    name: "NABL Accreditation",
    shortDescription: "Voluntary accreditation for testing and calibration labs to demonstrate quality and competence.",
    keyRequirements: ["Quality manual (ISO 15189)", "SOPs", "Internal audit report", "PT/EQAS participation"],
    authority: "NABL (QCI)",
    category: "accreditation",
    avgApprovalDays: 90,
    isHardGate: false,
  },
];

export const CATEGORY_LABELS: Record<LicenseCategory, string> = {
  mandatory: "Mandatory",
  optional: "Optional",
  accreditation: "Accreditation",
};
