import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Roadmap } from "@/models/Roadmap";
import { generateRoadmap } from "@/lib/ai";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const roadmap = await Roadmap.findOne({ organizationId: session.user.organizationId }).lean();
  return NextResponse.json(roadmap ?? null);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { labType, city, budget } = body;
    const generated = await generateRoadmap({
      labType: labType ?? "basic",
      city: city ?? "Mumbai",
      budget,
    });
    await connectDB();
    const roadmap = await Roadmap.findOneAndUpdate(
      { organizationId: session.user.organizationId },
      {
        organizationId: session.user.organizationId,
        tasks: generated.tasks,
        progress: 0,
        estimatedCost: generated.estimatedCost,
        timeline: generated.timeline,
      },
      { upsert: true, new: true }
    );
    return NextResponse.json(roadmap);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate roadmap" }, { status: 500 });
  }
}
