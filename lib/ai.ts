import type { ITask } from "@/types";

const LAB_TYPES = ["basic", "medium", "advanced", "clinic_lab"] as const;
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Pune"];

export interface RoadmapInput {
  labType: string;
  city: string;
  budget?: number;
}

export interface GeneratedRoadmap {
  timeline: { start: Date; end: Date };
  tasks: ITask[];
  estimatedCost: number;
}

export async function generateRoadmap(input: RoadmapInput): Promise<GeneratedRoadmap> {
  const labType = LAB_TYPES.includes(input.labType as (typeof LAB_TYPES)[number]) ? input.labType : "basic";
  const city = CITIES.includes(input.city) ? input.city : "Mumbai";
  const budget = input.budget ?? 1000000;

  const baseMonths = labType === "basic" ? 3 : labType === "medium" ? 5 : labType === "advanced" ? 7 : 4;
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + baseMonths);

  const tasks: ITask[] = [
    { title: "Location finalization", status: "pending", module: "setup", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { title: "Rent agreement", status: "pending", module: "legal", dependency: "Location finalization" },
    { title: "Layout planning", status: "pending", module: "infrastructure", dependency: "Rent agreement" },
    { title: "Power backup setup", status: "pending", module: "infrastructure", dependency: "Layout planning" },
    { title: "Water & waste planning", status: "pending", module: "compliance", dependency: "Layout planning" },
    { title: "Equipment installation", status: "pending", module: "equipment", dependency: "Layout planning" },
    { title: "Trial runs", status: "pending", module: "operations", dependency: "Equipment installation" },
  ];

  const costMultiplier = city === "Mumbai" || city === "Delhi" ? 1.2 : 1;
  const estimatedCost = Math.round(Math.min(budget, 500000 * costMultiplier * (labType === "advanced" ? 1.5 : 1)));

  return { timeline: { start, end }, tasks, estimatedCost };
}

export interface DocumentGapResult {
  missing: string[];
  suggestions: string[];
  score: number;
}

export async function documentGapAnalysis(licenseType: string, documents: string[]): Promise<DocumentGapResult> {
  void documents; // reserved for future document list validation
  const templates: Record<string, string[]> = {
    "Clinical Establishment": ["Registration form", "Address proof", "Medical qualification", "Fire NOC"],
    "BMW": ["Authorization form", "Waste management plan", "Agreement with CBWTF"],
    "Fire NOC": ["Building plan", "Fire safety certificate", "No objection letter"],
    "NABL": ["Quality manual", "SOPs", "Equipment list", "Personnel credentials"],
  };
  const required = templates[licenseType] ?? ["Application form", "ID proof", "Address proof"];
  return {
    missing: required.slice(0, 2),
    suggestions: ["Get notarized copies", "Ensure all stamps are clear"],
    score: 75,
  };
}

export async function estimateLicenseApprovalTime(licenseType: string, state: string): Promise<number> {
  const base: Record<string, number> = {
    "Clinical Establishment": 45,
    "BMW": 30,
    "Fire NOC": 21,
    "Trade License": 14,
    "NABL": 90,
  };
  const days = base[licenseType] ?? 30;
  const stateDelay: Record<string, number> = { Maharashtra: 7, "Tamil Nadu": 5, Karnataka: 10 };
  return days + (stateDelay[state] ?? 0);
}

export interface EquipmentRecommendation {
  name: string;
  category: string;
  estimatedCapex: number;
  vendors: { name: string; priceRange: [number, number] }[];
}

export async function recommendEquipment(testMenu: string[]): Promise<EquipmentRecommendation[]> {
  const menuStr = testMenu.join(" ").toLowerCase();
  const recommendations: EquipmentRecommendation[] = [];

  if (menuStr.includes("cbc") || menuStr.includes("hemoglobin")) {
    recommendations.push({
      name: "Hematology Analyzer",
      category: "Hematology",
      estimatedCapex: 450000,
      vendors: [
        { name: "Erba Mannheim", priceRange: [380000, 520000] },
        { name: "Sysmex", priceRange: [500000, 800000] },
      ],
    });
  }
  if (menuStr.includes("sugar") || menuStr.includes("creatinine") || menuStr.includes("liver")) {
    recommendations.push({
      name: "Biochemistry Analyzer",
      category: "Biochemistry",
      estimatedCapex: 650000,
      vendors: [
        { name: "Erba", priceRange: [550000, 750000] },
        { name: "Randox", priceRange: [600000, 900000] },
      ],
    });
  }
  if (recommendations.length === 0) {
    recommendations.push(
      {
        name: "Microscope",
        category: "General",
        estimatedCapex: 35000,
        vendors: [{ name: "Olympus", priceRange: [25000, 50000] }],
      },
      {
        name: "Centrifuge",
        category: "General",
        estimatedCapex: 25000,
        vendors: [{ name: "Remi", priceRange: [15000, 35000] }],
      }
    );
  }
  return recommendations;
}
