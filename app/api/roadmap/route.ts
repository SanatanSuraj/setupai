import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Roadmap } from "@/models/Roadmap";
import { generateRoadmap as aiFallbackRoadmap } from "@/lib/ai";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const roadmap = await Roadmap.findOne({
      organizationId: session.user.organizationId,
    }).lean();

    if (!roadmap) {
      return NextResponse.json(null);
    }
    // Frontend expects meta + phases at top level for backward compat
    return NextResponse.json({
      ...roadmap,
      meta: {
        labType: roadmap.labType,
        state: roadmap.state,
        district: roadmap.district,
        city: roadmap.city,
        budget: roadmap.estimatedCost,
      },
    });
  } catch (error) {
    console.error("GET /api/roadmap error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { labType, state, city, district, budget } = body;

    await connectDB();

    // Generate tasks using AI fallback (real AI handled by /api/ai/roadmap separately)
    const generated = await aiFallbackRoadmap({ labType, state, city, budget });
    const tasks = generated.tasks.map((t) => ({
      title: t.title,
      status: "pending",
      module: t.module ?? "General",
      dueDate: t.estimatedDays
        ? new Date(Date.now() + t.estimatedDays * 24 * 60 * 60 * 1000)
        : undefined,
    }));

    // Upsert — one roadmap per organization
    const roadmap = await Roadmap.findOneAndUpdate(
      { organizationId: session.user.organizationId },
      {
        $set: {
          organizationId: session.user.organizationId,
          tasks,
          progress: 0,
          estimatedCost: budget ?? 1_000_000,
          timeline: {
            start: new Date(),
            end: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          },
          // Store lab metadata on the roadmap for display
          labType: labType ?? "basic",
          state: state ?? "",
          district: district ?? "",
          city: city ?? "",
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error("POST /api/roadmap error:", error);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
