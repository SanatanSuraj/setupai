import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/setupai";
const client = new MongoClient(MONGODB_URI);

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { phases } = body;

    await client.connect();
    const db = client.db();
    await db.collection("roadmaps").updateOne(
      { userEmail: session.user.email },
      { $set: { phases, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Roadmap sync error:", error);
    return NextResponse.json({ error: "Failed to sync roadmap" }, { status: 500 });
  }
}