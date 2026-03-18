import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Roadmap } from "@/models/Roadmap";
import { newRequestId } from "@/lib/db-helpers";

export async function PUT(req: Request) {
  const requestId = newRequestId();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.phases)) {
      return NextResponse.json({ error: "phases array required", requestId }, { status: 400 });
    }

    const { phases } = body;

    await connectDB();

    const roadmap = await Roadmap.findOne({
      organizationId: session.user.organizationId,
    });

    if (!roadmap) {
      return NextResponse.json({ ok: true, synced: false, requestId });
    }

    roadmap.phases = phases;
    roadmap.markModified("phases");

    let totalTasks = 0;
    let doneTasks = 0;
    for (const phase of phases as Array<{ tasks?: Array<{ done?: boolean }> }>) {
      if (Array.isArray(phase?.tasks)) {
        for (const t of phase.tasks) {
          totalTasks++;
          if (t.done) doneTasks++;
        }
      }
    }
    if (totalTasks > 0) {
      roadmap.progress = Math.round((doneTasks / totalTasks) * 100);
    }

    await roadmap.save();

    console.log("[Roadmap] Sync persisted:", phases.length, "phases,", doneTasks, "tasks done, progress:", roadmap.progress + "%");
    return NextResponse.json({ ok: true, synced: true, progress: roadmap.progress, requestId });
  } catch (error) {
    console.error("[PUT /api/roadmap/sync]", error);
    return NextResponse.json({ error: "Failed to sync roadmap", requestId }, { status: 500 });
  }
}