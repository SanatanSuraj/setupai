import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { QCLog } from "@/models/QCLog";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const logs = await QCLog.find({ organizationId: session.user.organizationId }).sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { testName, value, controlRange, correctiveAction } = body;
    const min = controlRange?.min ?? value - 5;
    const max = controlRange?.max ?? value + 5;
    const status = value >= min && value <= max ? "in_range" : "out_of_range";
    await connectDB();
    const log = await QCLog.create({
      organizationId: session.user.organizationId,
      testName: testName ?? "QC Test",
      value,
      controlRange: { min, max },
      status,
      correctiveAction: status === "out_of_range" ? correctiveAction : undefined,
    });
    return NextResponse.json(log);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add QC log" }, { status: 500 });
  }
}
