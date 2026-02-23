import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Roadmap } from "@/models/Roadmap";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { taskIndex, status } = body;
  if (typeof taskIndex !== "number" || !status) {
    return NextResponse.json({ error: "taskIndex and status required" }, { status: 400 });
  }
  await connectDB();
  const roadmap = await Roadmap.findOne({ organizationId: session.user.organizationId });
  if (!roadmap || !roadmap.tasks[taskIndex]) {
    return NextResponse.json({ error: "Roadmap or task not found" }, { status: 404 });
  }
  (roadmap.tasks[taskIndex] as { status: string }).status = status;
  const completed = roadmap.tasks.filter((t: { status: string }) => t.status === "completed").length;
  roadmap.progress = Math.round((completed / roadmap.tasks.length) * 100);
  await roadmap.save();
  return NextResponse.json(roadmap);
}
