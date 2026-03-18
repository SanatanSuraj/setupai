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

    const body = await req.json();
    const { phases } = body;

    await connectDB();
    await Roadmap.findOneAndUpdate(
      { organizationId: session.user.organizationId },
      { $set: { phases } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, requestId });
  } catch (error) {
    console.error("Roadmap sync error:", error);
    return NextResponse.json({ error: "Failed to sync roadmap", requestId }, { status: 500 });
  }
}