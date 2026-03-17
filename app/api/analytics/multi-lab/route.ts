import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Organization } from "@/models/Organization";
import { SampleOrder } from "@/models/SampleOrder";
import { Staff } from "@/models/Staff";
import { Equipment } from "@/models/Equipment";
import connectDB from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d';

    await connectDB();

    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // For demo purposes, we'll simulate multi-lab data
    // In a real implementation, this would query across multiple organizations
    // that belong to the same parent company/franchise

    // Mock multi-lab data
    const mockLabs = [
      {
        labId: "lab001",
        labName: "SetupAI Lab - Mumbai Central",
        location: "Mumbai, Maharashtra",
        revenue: 450000,
        sampleVolume: 1250,
        tatCompliance: 94,
        qualityScore: 92,
        status: 'excellent' as const
      },
      {
        labId: "lab002", 
        labName: "SetupAI Lab - Pune",
        location: "Pune, Maharashtra",
        revenue: 380000,
        sampleVolume: 980,
        tatCompliance: 88,
        qualityScore: 89,
        status: 'good' as const
      },
      {
        labId: "lab003",
        labName: "SetupAI Lab - Noida",
        location: "Noida, Uttar Pradesh", 
        revenue: 320000,
        sampleVolume: 850,
        tatCompliance: 82,
        qualityScore: 85,
        status: 'good' as const
      },
      {
        labId: "lab004",
        labName: "SetupAI Lab - Bangalore",
        location: "Bangalore, Karnataka",
        revenue: 290000,
        sampleVolume: 720,
        tatCompliance: 76,
        qualityScore: 78,
        status: 'needs_improvement' as const
      },
      {
        labId: "lab005",
        labName: "SetupAI Lab - Gurgaon",
        location: "Gurgaon, Haryana",
        revenue: 180000,
        sampleVolume: 450,
        tatCompliance: 68,
        qualityScore: 72,
        status: 'critical' as const
      }
    ];

    const overview = {
      totalLabs: mockLabs.length,
      activeLabs: mockLabs.filter(lab => lab.status !== 'critical').length,
      totalRevenue: mockLabs.reduce((sum, lab) => sum + lab.revenue, 0),
      avgPerformance: Math.round(mockLabs.reduce((sum, lab) => sum + lab.qualityScore, 0) / mockLabs.length)
    };

    const complianceAcrossLocations = [
      {
        state: "Maharashtra",
        labs: 2,
        avgCompliance: 91,
        criticalIssues: 0,
        nablAccredited: 2
      },
      {
        state: "Uttar Pradesh", 
        labs: 1,
        avgCompliance: 85,
        criticalIssues: 1,
        nablAccredited: 0
      },
      {
        state: "Karnataka",
        labs: 1,
        avgCompliance: 78,
        criticalIssues: 2,
        nablAccredited: 1
      },
      {
        state: "Haryana",
        labs: 1,
        avgCompliance: 72,
        criticalIssues: 3,
        nablAccredited: 0
      }
    ];

    const financialConsolidation = {
      totalRevenue: overview.totalRevenue,
      totalCosts: Math.round(overview.totalRevenue * 0.7), // 70% cost ratio
      netProfit: Math.round(overview.totalRevenue * 0.3), // 30% profit
      profitMargin: 30,
      revenueByState: [
        { state: "Maharashtra", revenue: 830000, growth: 12 },
        { state: "Uttar Pradesh", revenue: 320000, growth: 8 },
        { state: "Karnataka", revenue: 290000, growth: -5 },
        { state: "Haryana", revenue: 180000, growth: 15 }
      ]
    };

    const staffMetrics = {
      totalStaff: 85,
      avgProductivity: 86,
      trainingCompliance: 88,
      turnoverRate: 12,
      staffByRole: [
        { role: "Pathologist", count: 5, avgSalary: 85000 },
        { role: "Lab Technician", count: 25, avgSalary: 28000 },
        { role: "Phlebotomist", count: 15, avgSalary: 22000 },
        { role: "Quality Manager", count: 5, avgSalary: 55000 },
        { role: "Administrative", count: 20, avgSalary: 35000 },
        { role: "Support Staff", count: 15, avgSalary: 18000 }
      ]
    };

    const equipmentUtilization = {
      totalEquipment: 120,
      avgUtilization: 82,
      maintenanceDue: 8,
      equipmentByCategory: [
        { category: "Hematology Analyzers", count: 15, utilization: 88, roi: 18 },
        { category: "Biochemistry Analyzers", count: 12, utilization: 92, roi: 22 },
        { category: "Microscopes", count: 25, utilization: 75, roi: 12 },
        { category: "Centrifuges", count: 20, utilization: 85, roi: 15 },
        { category: "Microbiology Equipment", count: 18, utilization: 78, roi: 14 },
        { category: "Immunoassay Systems", count: 8, utilization: 95, roi: 25 },
        { category: "Molecular Diagnostics", count: 5, utilization: 90, roi: 28 },
        { category: "Support Equipment", count: 17, utilization: 70, roi: 8 }
      ]
    };

    const analytics = {
      overview,
      performanceMetrics: mockLabs,
      complianceAcrossLocations,
      financialConsolidation,
      staffMetrics,
      equipmentUtilization
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error fetching multi-lab analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}