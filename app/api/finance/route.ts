import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { FinancialModel } from "@/models/FinancialModel";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const model = await FinancialModel.findOne({ organizationId: session.user.organizationId }).lean();
  return NextResponse.json(model ?? null);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { capex, opex, revenueProjection, breakEvenMonths } = body;
    await connectDB();
    const model = await FinancialModel.findOneAndUpdate(
      { organizationId: session.user.organizationId },
      {
        capex: capex ?? 0,
        opex: opex ?? 0,
        revenueProjection: Array.isArray(revenueProjection) ? revenueProjection : [],
        breakEvenMonths: breakEvenMonths ?? 0,
      },
      { upsert: true, new: true }
    );
    return NextResponse.json(model);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update financial model" }, { status: 500 });
  }
}
