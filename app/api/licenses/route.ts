import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { License } from "@/models/License";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const licenses = await License.find({ organizationId: session.user.organizationId }).lean();
  return NextResponse.json(licenses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const { type, state, district, status } = body;
    await connectDB();
    const license = await License.create({
      organizationId: session.user.organizationId,
      type: type ?? "Clinical Establishment",
      state: state ?? "Maharashtra",
      district: district ?? "General",
      status: status ?? "pending",
      documents: [],
    });
    return NextResponse.json(license);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create license" }, { status: 500 });
  }
}
