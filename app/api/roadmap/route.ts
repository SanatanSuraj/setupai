import { IRoadmap } from "@/types";
import { NextResponse } from "next/server";

// Mock database storage for demonstration 
// (In production, you'd use Prisma/MongoDB)
let mockRoadmapStore: IRoadmap | null = null;

export async function GET() {
  try {
    // If no roadmap exists yet, return a 404 or empty object
    if (!mockRoadmapStore) {
      return NextResponse.json(null);
    }
    return NextResponse.json(mockRoadmapStore);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { labType, state, city, budget } = body;

    // Simulate generating a roadmap based on input
    const newRoadmap = {
      _id: "roadmap_" + Date.now(),
      tasks: [
        { title: `Initialize ${labType} lab in ${city}`, status: "in_progress", module: "Planning" },
        { title: `Apply for ${state} Health License`, status: "pending", module: "Legal" },
        { title: "Procure Equipment", status: "pending", module: "Operations" },
      ],
      progress: 10,
      estimatedCost: budget || 1000000,
      timeline: { start: new Date().toISOString(), end: "2026-12-31" },
    };

    mockRoadmapStore = newRoadmap;
    return NextResponse.json(newRoadmap);
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}