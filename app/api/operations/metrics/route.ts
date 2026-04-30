import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { SampleOrder } from "@/models/SampleOrder";
import { Staff } from "@/models/Staff";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// Average test price in INR for a small diagnostic lab (India).
// Update this constant when real pricing data is available.
const AVG_TEST_PRICE_INR = 800;
const COST_PER_TEST_INR  = 350; // approximate reagent + overhead cost per test

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const organizationId = session.user.organizationId;
    const now = new Date();
    const startOfDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // ── Sample tracking (real DB data) ────────────────────────────────────────
    const [dailySamples, monthlySamples, staff] = await Promise.all([
      SampleOrder.find({ organizationId, createdAt: { $gte: startOfDay } }),
      SampleOrder.find({ organizationId, createdAt: { $gte: startOfMonth } }),
      Staff.find({ organizationId }),
    ]);

    const tatCompliantSamples = dailySamples.filter(s => (s.TAT ?? 24) <= 24);
    const rejectedSamples     = dailySamples.filter(s => s.status === "rejected");
    const avgTAT = dailySamples.length > 0
      ? dailySamples.reduce((sum, s) => sum + (s.TAT ?? 24), 0) / dailySamples.length
      : 0;

    // ── Staff metrics (computed from real Staff documents) ────────────────────
    const totalStaff = staff.length;
    const certifiedStaff = staff.filter(s => s.trainingStatus === "certified").length;
    // Productivity proxy: ratio of non-expired staff to total (expired = inactive)
    const activeStaff = staff.filter(s => s.trainingStatus !== "expired").length;
    const staffMetrics = {
      // Attendance: no attendance model yet — use a conservative industry average.
      // Replace with real calculation when an attendance record is added.
      attendance: 92,
      productivity: totalStaff > 0 ? Math.round((activeStaff  / totalStaff) * 100) : 0,
      trainingCompliance: totalStaff > 0 ? Math.round((certifiedStaff / totalStaff) * 100) : 0,
    };

    // ── BMW tracking (estimated from monthly sample volume) ───────────────────
    // Industry estimate: a clinical lab generates ~0.05 kg of biomedical waste per sample.
    // Category split follows CPCB BMW Rules 2016 proportions for a diagnostic lab:
    //   Yellow (Pathological) ~40%, Red (Contaminated) ~27%, White (Sharps) ~18%, Blue (Pharma) ~15%
    const monthlyGeneration = Math.round(monthlySamples.length * 0.05 * 10) / 10; // 1-dp kg
    const bmwTracking = {
      monthlyGeneration: monthlyGeneration || 0,
      disposalCompliance: true, // assumes valid CBWTF contract; update via a BMW model when available
      nextPickupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      wasteCategories: {
        yellow: Math.round(monthlyGeneration * 0.40 * 10) / 10,
        red:    Math.round(monthlyGeneration * 0.27 * 10) / 10,
        white:  Math.round(monthlyGeneration * 0.18 * 10) / 10,
        blue:   Math.round(monthlyGeneration * 0.15 * 10) / 10,
      },
    };

    // ── Financial metrics (computed from real sample data) ────────────────────
    const dailyRevenue  = dailySamples.length * AVG_TEST_PRICE_INR;
    const profitMargin  = AVG_TEST_PRICE_INR > 0
      ? Math.round(((AVG_TEST_PRICE_INR - COST_PER_TEST_INR) / AVG_TEST_PRICE_INR) * 100)
      : 0;
    const financialMetrics = {
      dailyRevenue,
      costPerTest: COST_PER_TEST_INR,
      profitMargin,
    };

    const metrics = {
      sampleTracking: {
        dailyVolume:   dailySamples.length,
        tatCompliance: dailySamples.length > 0
          ? Math.round((tatCompliantSamples.length / dailySamples.length) * 100)
          : 0,
        rejectionRate: dailySamples.length > 0
          ? Math.round((rejectedSamples.length / dailySamples.length) * 100)
          : 0,
        avgTAT: Math.round(avgTAT),
      },
      bmwTracking,
      staffMetrics,
      financialMetrics,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching operations metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch operations metrics" },
      { status: 500 }
    );
  }
}