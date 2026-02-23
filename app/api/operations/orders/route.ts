import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { SampleOrder } from "@/models/SampleOrder";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const orders = await SampleOrder.find({ organizationId: session.user.organizationId }).sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { patientName, testType } = body;
    await connectDB();
    const order = await SampleOrder.create({
      organizationId: session.user.organizationId,
      patientName: patientName ?? "Patient",
      testType: testType ?? "General",
      status: "collected",
      collectedAt: new Date(),
    });
    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
