import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { recommendEquipment } from "@/lib/ai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const testMenu = Array.isArray(body.testMenu) ? body.testMenu : body.testMenu ? [body.testMenu] : ["CBC", "Sugar", "Creatinine"];
    const recommendations = await recommendEquipment(testMenu);
    return NextResponse.json(recommendations);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}
