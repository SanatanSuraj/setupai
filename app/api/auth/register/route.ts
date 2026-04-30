import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Organization } from "@/models/Organization";
import { withTransaction, isDuplicateKeyError, newRequestId, sessionOpt } from "@/lib/db-helpers";
import { z } from "zod";

const schema = z.object({
  name:             z.string().min(1),
  email:            z.string().email(),
  password:         z.string().min(8),
  organizationName: z.string().min(1).optional(),
  labType:          z.enum(["basic", "medium", "advanced", "clinic_lab"]).optional(),
  city:             z.string().min(1).optional(),
  state:            z.string().min(1).optional(),
});

export async function POST(req: Request) {
  const requestId = newRequestId();

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten(), requestId },
        { status: 400 }
      );
    }

    const { name, email, password, organizationName, labType, city, state } =
      parsed.data;

    await connectDB();

    // Eager duplicate-email check before we start the transaction so we can
    // return a clean 400 without opening a session.
    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered", requestId },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    // ── Atomic: create Org + User inside one transaction ─────────────────────
    // If User creation fails (e.g., race-condition duplicate email) the
    // Organisation insert is rolled back automatically.
    const { userId, orgId } = await withTransaction(async (txSession) => {
      const [org] = await Organization.create(
        [
          {
            name:             organizationName ?? `${name}'s Lab`,
            labType:          labType ?? "basic",
            city:             (city && city.trim()) ? city.trim() : "Not specified",
            state:            state ?? "",
            subscriptionTier: "free",
          },
        ],
        sessionOpt(txSession)
      );

      const [user] = await User.create(
        [
          {
            name,
            email,
            password: hashed,
            role:           "admin",
            organizationId: org._id,
          },
        ],
        sessionOpt(txSession)
      );

      return { userId: user._id.toString(), orgId: org._id.toString() };
    });

    return NextResponse.json({ id: userId, email, name, organizationId: orgId, requestId });
  } catch (e: unknown) {
    console.error("Registration error:", e);

    if (isDuplicateKeyError(e)) {
      return NextResponse.json(
        { error: "Email already registered", requestId },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed", requestId },
      { status: 500 }
    );
  }
}
