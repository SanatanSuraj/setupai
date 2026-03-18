import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Roadmap } from "@/models/Roadmap";
import { newRequestId } from "@/lib/db-helpers";

const VALID_STATUSES = ["pending", "in_progress", "completed", "blocked"];

export async function PATCH(req: Request) {
  const requestId = newRequestId();
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) {
    return NextResponse.json({ error: "Unauthorized", requestId }, { status: 401 });
  }

  let body: { taskIndex?: unknown; status?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", requestId }, { status: 400 });
  }

  const { taskIndex, status } = body;

  if (typeof taskIndex !== "number" || !status) {
    return NextResponse.json(
      { error: "taskIndex (number) and status (string) are required", requestId },
      { status: 400 }
    );
  }

  if (!VALID_STATUSES.includes(status as string)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`, requestId },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const roadmap = await Roadmap.findOne({
      organizationId: session.user.organizationId,
    });

    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found", requestId }, { status: 404 });
    }

    if (!roadmap.tasks[taskIndex]) {
      return NextResponse.json(
        { error: `Task at index ${taskIndex} not found`, requestId },
        { status: 404 }
      );
    }

    // Mutate the Mixed-type array element.
    // Cast through `unknown` because ITask is typed but the schema field is
    // Mixed, so Mongoose stores plain objects at runtime.
    (roadmap.tasks[taskIndex] as unknown as Record<string, unknown>).status = status;

    // REQUIRED: Mongoose does not track mutations inside Mixed fields automatically.
    // Without this, the save() call will NOT persist the change.
    roadmap.markModified("tasks");

    // Recalculate progress percentage
    const completedCount = (roadmap.tasks as unknown as Record<string, unknown>[]).filter(
      (t) => t.status === "completed"
    ).length;
    roadmap.progress = Math.round((completedCount / roadmap.tasks.length) * 100);
    roadmap.set("updatedBy", session.user.id ?? null);
    roadmap.set("requestId", requestId);

    await roadmap.save();

    return NextResponse.json({ data: roadmap, requestId });
  } catch (err) {
    console.error("[PATCH /api/roadmap/progress]", err);
    return NextResponse.json({ error: "Failed to update task", requestId }, { status: 500 });
  }
}
