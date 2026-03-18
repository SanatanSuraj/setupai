import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { SampleOrder } from "@/models/SampleOrder";
import { Staff } from "@/models/Staff";
import { connectDB } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const organizationId = session.user.organizationId;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Sample tracking metrics
    const dailySamples = await SampleOrder.find({
      organizationId,
      createdAt: { $gte: startOfDay }
    });

    const monthlySamples = await SampleOrder.find({
      organizationId,
      createdAt: { $gte: startOfMonth }
    });

    const deliveredSamples = dailySamples.filter(s => s.status === 'delivered');
    const tatCompliantSamples = dailySamples.filter(s => {
      const tat = s.TAT || 24; // Default TAT if not set
      return tat <= 24; // Within 24 hours
    });

    const rejectedSamples = dailySamples.filter(s => s.status === 'rejected');
    const avgTAT = dailySamples.length > 0 ? 
      dailySamples.reduce((sum, s) => sum + (s.TAT || 24), 0) / dailySamples.length : 0;

    // Staff metrics
    const staff = await Staff.find({ organizationId });
    const staffMetrics = {
      attendance: 92, // Mock data - would come from attendance system
      productivity: 88,
      trainingCompliance: 85
    };

    // BMW tracking (mock data - would come from BMW management system)
    const bmwTracking = {
      monthlyGeneration: Math.round(Math.random() * 50) + 20, // 20-70 kg
      disposalCompliance: Math.random() > 0.2, // 80% compliance rate
      nextPickupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      wasteCategories: {
        yellow: Math.round(Math.random() * 20) + 5,
        red: Math.round(Math.random() * 15) + 3,
        white: Math.round(Math.random() * 10) + 2,
        blue: Math.round(Math.random() * 8) + 1
      }
    };

    // Financial metrics (mock data)
    const financialMetrics = {
      dailyRevenue: Math.round(Math.random() * 50000) + 25000,
      costPerTest: Math.round(Math.random() * 200) + 100,
      profitMargin: Math.round(Math.random() * 30) + 20
    };

    const metrics = {
      sampleTracking: {
        dailyVolume: dailySamples.length,
        tatCompliance: dailySamples.length > 0 ? Math.round((tatCompliantSamples.length / dailySamples.length) * 100) : 0,
        rejectionRate: dailySamples.length > 0 ? Math.round((rejectedSamples.length / dailySamples.length) * 100) : 0,
        avgTAT: Math.round(avgTAT)
      },
      bmwTracking,
      staffMetrics,
      financialMetrics
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