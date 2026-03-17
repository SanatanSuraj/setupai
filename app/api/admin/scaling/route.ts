import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { jobScheduler } from "@/lib/scheduler/job-scheduler";
import { SCALING_TARGETS, PERFORMANCE_THRESHOLDS } from "@/lib/jobs/compliance-monitor";
import { Organization } from "@/models/Organization";
import { TenantBranding } from "@/models/TenantBranding";
import { SampleOrder } from "@/models/SampleOrder";
import connectDB from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email?.includes('@setupai.com')) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    await connectDB();

    // Get current system metrics
    const systemMetrics = await getSystemMetrics();
    
    // Get job scheduler status
    const jobStatus = jobScheduler.getJobStatus() as any[];
    
    // Get scaling recommendations
    const scalingRecommendations = await getScalingRecommendations(systemMetrics);
    
    // Get performance metrics
    const performanceMetrics = await getPerformanceMetrics();

    return NextResponse.json({
      success: true,
      data: {
        systemMetrics,
        jobStatus,
        scalingRecommendations,
        performanceMetrics,
        scalingTargets: SCALING_TARGETS,
        performanceThresholds: PERFORMANCE_THRESHOLDS
      }
    });
  } catch (error) {
    console.error("Error fetching scaling metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch scaling metrics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email?.includes('@setupai.com')) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const { action, jobName, config } = body;

    switch (action) {
      case 'execute_job':
        if (!jobName) {
          return NextResponse.json({ error: "Job name required" }, { status: 400 });
        }
        
        const result = await jobScheduler.executeJobManually(jobName);
        return NextResponse.json({
          success: true,
          data: result,
          message: `Job '${jobName}' executed successfully`
        });

      case 'toggle_job':
        if (!jobName || config?.enabled === undefined) {
          return NextResponse.json({ error: "Job name and enabled status required" }, { status: 400 });
        }
        
        jobScheduler.setJobEnabled(jobName, config.enabled);
        return NextResponse.json({
          success: true,
          message: `Job '${jobName}' ${config.enabled ? 'enabled' : 'disabled'}`
        });

      case 'scale_resources':
        // In a real implementation, this would trigger infrastructure scaling
        // For now, we'll just simulate the scaling action
        const scalingResult = await simulateScaling(config);
        return NextResponse.json({
          success: true,
          data: scalingResult,
          message: "Scaling operation initiated"
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error executing scaling action:", error);
    return NextResponse.json(
      { error: "Failed to execute scaling action" },
      { status: 500 }
    );
  }
}

// Get current system metrics
async function getSystemMetrics() {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Database metrics
  const totalOrganizations = await Organization.countDocuments();
  const activeOrganizations = await Organization.countDocuments({ status: 'active' });
  const newOrganizationsToday = await Organization.countDocuments({ 
    createdAt: { $gte: dayAgo } 
  });

  // Tenant metrics
  const totalTenants = await TenantBranding.countDocuments({ isActive: true });
  const whitelabelTenants = await TenantBranding.countDocuments({ 
    'whitelabelConfig.hideSetupAiBranding': true 
  });

  // Sample processing metrics
  const dailySamples = await SampleOrder.countDocuments({ 
    createdAt: { $gte: dayAgo } 
  });
  const monthlySamples = await SampleOrder.countDocuments({ 
    createdAt: { $gte: monthAgo } 
  });

  // Subscription distribution
  const subscriptionDistribution = await TenantBranding.aggregate([
    { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
  ]);

  return {
    organizations: {
      total: totalOrganizations,
      active: activeOrganizations,
      newToday: newOrganizationsToday,
      utilizationRate: totalOrganizations > 0 ? (activeOrganizations / totalOrganizations) * 100 : 0
    },
    tenants: {
      total: totalTenants,
      whitelabel: whitelabelTenants,
      whitelabelPercentage: totalTenants > 0 ? (whitelabelTenants / totalTenants) * 100 : 0
    },
    sampleProcessing: {
      dailyVolume: dailySamples,
      monthlyVolume: monthlySamples,
      avgDailyVolume: Math.round(monthlySamples / 30),
      capacityUtilization: (dailySamples / SCALING_TARGETS.documents_per_day) * 100
    },
    subscriptions: subscriptionDistribution.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>),
    scalingStatus: {
      currentUsers: Math.floor(Math.random() * 5000) + 1000, // Mock data
      targetUsers: SCALING_TARGETS.concurrent_users,
      currentLabs: totalOrganizations,
      targetLabs: SCALING_TARGETS.labs_supported,
      currentApiRps: Math.floor(Math.random() * 500) + 100, // Mock data
      targetApiRps: SCALING_TARGETS.api_requests_per_second
    }
  };
}

// Get scaling recommendations
async function getScalingRecommendations(metrics: any) {
  const recommendations = [];

  // Check if approaching scaling limits
  if (metrics.organizations.total > SCALING_TARGETS.labs_supported * 0.8) {
    recommendations.push({
      type: 'infrastructure',
      priority: 'high',
      title: 'Scale Database Infrastructure',
      description: 'Approaching maximum lab capacity. Consider database sharding or additional read replicas.',
      action: 'scale_database',
      estimatedImpact: 'Supports up to 2000 labs'
    });
  }

  if (metrics.sampleProcessing.capacityUtilization > 80) {
    recommendations.push({
      type: 'processing',
      priority: 'medium',
      title: 'Scale Document Processing',
      description: 'Document processing capacity at 80%. Consider adding more background workers.',
      action: 'scale_workers',
      estimatedImpact: 'Increases processing capacity by 50%'
    });
  }

  if (metrics.tenants.whitelabelPercentage > 60) {
    recommendations.push({
      type: 'architecture',
      priority: 'low',
      title: 'Optimize Multi-Tenant Architecture',
      description: 'High percentage of white-label tenants. Consider tenant-specific optimizations.',
      action: 'optimize_tenancy',
      estimatedImpact: 'Improves tenant isolation and performance'
    });
  }

  // Performance-based recommendations
  const avgResponseTime = Math.random() * 1000 + 200; // Mock data
  if (avgResponseTime > PERFORMANCE_THRESHOLDS.api_response_time_ms) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'Optimize API Performance',
      description: `API response time (${Math.round(avgResponseTime)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.api_response_time_ms}ms).`,
      action: 'optimize_api',
      estimatedImpact: 'Reduces response time by 40%'
    });
  }

  return recommendations;
}

// Get performance metrics
async function getPerformanceMetrics() {
  // In a real implementation, these would come from monitoring systems
  return {
    apiResponseTime: {
      current: Math.random() * 500 + 100,
      threshold: PERFORMANCE_THRESHOLDS.api_response_time_ms,
      trend: Math.random() > 0.5 ? 'improving' : 'degrading'
    },
    databaseQueryTime: {
      current: Math.random() * 80 + 20,
      threshold: PERFORMANCE_THRESHOLDS.database_query_time_ms,
      trend: 'stable'
    },
    documentProcessingTime: {
      current: Math.random() * 3000 + 1000,
      threshold: PERFORMANCE_THRESHOLDS.document_processing_time_ms,
      trend: 'improving'
    },
    aiValidationTime: {
      current: Math.random() * 8000 + 2000,
      threshold: PERFORMANCE_THRESHOLDS.ai_validation_time_ms,
      trend: 'stable'
    },
    systemHealth: {
      cpu: Math.random() * 40 + 30,
      memory: Math.random() * 30 + 40,
      disk: Math.random() * 20 + 10,
      network: Math.random() * 50 + 20
    },
    errorRates: {
      api: Math.random() * 2,
      database: Math.random() * 0.5,
      ai: Math.random() * 5,
      jobs: Math.random() * 1
    }
  };
}

// Simulate scaling operations
async function simulateScaling(config: any) {
  const { resourceType, scalingFactor } = config;
  
  // Simulate scaling delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const results = {
    database: {
      action: 'Added read replica',
      oldCapacity: '1000 concurrent connections',
      newCapacity: '2000 concurrent connections',
      estimatedCost: '$200/month'
    },
    workers: {
      action: 'Increased background workers',
      oldCapacity: '10 workers',
      newCapacity: `${10 * (scalingFactor || 1.5)} workers`,
      estimatedCost: '$100/month'
    },
    api: {
      action: 'Added API server instances',
      oldCapacity: '2 instances',
      newCapacity: `${2 * (scalingFactor || 2)} instances`,
      estimatedCost: '$300/month'
    }
  };
  
  return results[resourceType as keyof typeof results] || {
    action: 'Unknown scaling operation',
    oldCapacity: 'N/A',
    newCapacity: 'N/A',
    estimatedCost: '$0/month'
  };
}