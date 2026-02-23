import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { Equipment } from "@/models/Equipment";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const equipment = await Equipment.find({ organizationId: session.user.organizationId }).lean();
  return NextResponse.json(equipment);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { name, category, capex, maintenanceCost, vendorId } = body;
    await connectDB();
    const equipment = await Equipment.create({
      organizationId: session.user.organizationId,
      name: name ?? "Equipment",
      category: category ?? "General",
      capex: capex ?? 0,
      maintenanceCost,
      vendorId: vendorId || undefined,
    });
    return NextResponse.json(equipment);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to add equipment" }, { status: 500 });
  }
}
