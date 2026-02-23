import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { SampleOrder } from "@/models/SampleOrder";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const { status } = body;
  if (!status) return NextResponse.json({ error: "status required" }, { status: 400 });
  await connectDB();
  const order = await SampleOrder.findOneAndUpdate(
    { _id: id, organizationId: session.user.organizationId },
    { status },
    { new: true }
  );
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}
