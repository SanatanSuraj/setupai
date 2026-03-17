"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  DollarSign,
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Calendar,
  Filter
} from "lucide-react";

interface MultiLabAnalytics {
  overview: {
    totalLabs: number;
    activeLabs: number;
    totalRevenue: number;
    avgPerformance: number;
  };
  performanceMetrics: {
    labId: string;
    labName: string;
    location: string;
    revenue: number;
    sampleVolume: number;
    tatCompliance: number;
    qualityScore: number;
    status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  }[];
  complianceAcrossLocations: {
    state: string;
    labs: number;
    avgCompliance: number;
    criticalIssues: number;
    nablAccredited: number;
  }[];
  financialConsolidation: {
    totalRevenue: number;
    totalCosts: number;
    netProfit: number;
    profitMargin: number;
    revenueByState: Array<{
      state: string;
      revenue: number;
      growth: number;
    }>;
  };
  staffMetrics: {
    totalStaff: number;
    avgProductivity: number;
    trainingCompliance: number;
    turnoverRate: number;
    staffByRole: Array<{
      role: string;
      count: number;
      avgSalary: number;
    }>;
  };
  equipmentUtilization: {
    totalEquipment: number;
    avgUtilization: number;
    maintenanceDue: number;
    equipmentByCategory: Array<{
      category: string;
      count: number;
      utilization: number;
      roi: number;
    }>;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<MultiLabAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    // Fetch analytics data
    fetch(`/api/analytics/multi-lab?timeRange=${selectedTimeRange}`)
      .then(r => r.json())
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, [selectedTimeRange]);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-slate-600">Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Multi-Lab Analytics</h1>
          <p className="text-slate-600">Enterprise-grade analytics across all laboratory locations</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Labs</p>
              <p className="text-2xl font-bold text-blue-800">{analytics.overview.totalLabs}</p>
              <p className="text-xs text-blue-600">{analytics.overview.activeLabs} active</p>
            </div>
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-800">₹{analytics.overview.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600">this period</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Avg Performance</p>
              <p className="text-2xl font-bold text-purple-800">{analytics.overview.avgPerformance}%</p>
              <p className="text-xs text-purple-600">across all labs</p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Profit Margin</p>
              <p className="text-2xl font-bold text-orange-800">{analytics.financialConsolidation.profitMargin}%</p>
              <p className="text-xs text-orange-600">consolidated</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Multi-Lab Performance Dashboard */}
      <Card
        title="Laboratory Performance Comparison"
        subtitle="Performance metrics across all laboratory locations"
        icon={BarChart3}
      >
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="revenue">Revenue</option>
              <option value="sampleVolume">Sample Volume</option>
              <option value="tatCompliance">TAT Compliance</option>
              <option value="qualityScore">Quality Score</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Laboratory</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Volume</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">TAT</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Quality</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.performanceMetrics.map((lab, index) => (
                  <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-800">{lab.labName}</td>
                    <td className="py-3 px-4 text-slate-600">{lab.location}</td>
                    <td className="py-3 px-4 text-slate-800">₹{lab.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-slate-600">{lab.sampleVolume}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${lab.tatCompliance >= 90 ? 'text-green-600' : lab.tatCompliance >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {lab.tatCompliance}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${lab.qualityScore >= 90 ? 'text-green-600' : lab.qualityScore >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {lab.qualityScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={
                        lab.status === 'excellent' ? 'success' :
                        lab.status === 'good' ? 'info' :
                        lab.status === 'needs_improvement' ? 'warning' : 'danger'
                      }>
                        {lab.status.replace('_', ' ')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Compliance Across Locations */}
      <Card
        title="Compliance Status by State"
        subtitle="Regulatory compliance monitoring across different states"
        icon={CheckCircle}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.complianceAcrossLocations.map((state, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-slate-800">{state.state}</h3>
                <Badge variant="info">{state.labs} labs</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Avg Compliance</span>
                  <span className={`font-medium ${state.avgCompliance >= 90 ? 'text-green-600' : state.avgCompliance >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {state.avgCompliance}%
                  </span>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${state.avgCompliance >= 90 ? 'bg-green-600' : state.avgCompliance >= 80 ? 'bg-yellow-600' : 'bg-red-600'}`}
                    style={{ width: `${state.avgCompliance}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Critical Issues</span>
                  <Badge variant={state.criticalIssues > 0 ? 'danger' : 'success'}>
                    {state.criticalIssues}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">NABL Accredited</span>
                  <span className="font-medium text-blue-600">{state.nablAccredited}/{state.labs}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Financial Consolidation & Staff Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Financial Consolidation"
          icon={DollarSign}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-800">₹{analytics.financialConsolidation.totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-green-600">Total Revenue</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-800">₹{analytics.financialConsolidation.totalCosts.toLocaleString()}</div>
                <div className="text-xs text-red-600">Total Costs</div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-800">₹{analytics.financialConsolidation.netProfit.toLocaleString()}</div>
              <div className="text-sm text-blue-600">Net Profit ({analytics.financialConsolidation.profitMargin}% margin)</div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-800">Revenue by State</h4>
              {analytics.financialConsolidation.revenueByState.map((state, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">{state.state}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">₹{state.revenue.toLocaleString()}</span>
                    <Badge variant={state.growth >= 0 ? 'success' : 'danger'}>
                      {state.growth >= 0 ? '+' : ''}{state.growth}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          title="Staff Performance Metrics"
          icon={Users}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-800">{analytics.staffMetrics.totalStaff}</div>
                <div className="text-xs text-blue-600">Total Staff</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-800">{analytics.staffMetrics.avgProductivity}%</div>
                <div className="text-xs text-green-600">Avg Productivity</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Training Compliance</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${analytics.staffMetrics.trainingCompliance}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.staffMetrics.trainingCompliance}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Turnover Rate</span>
                <Badge variant={analytics.staffMetrics.turnoverRate <= 10 ? 'success' : analytics.staffMetrics.turnoverRate <= 20 ? 'warning' : 'danger'}>
                  {analytics.staffMetrics.turnoverRate}%
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-800">Staff by Role</h4>
              {analytics.staffMetrics.staffByRole.map((role, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm text-slate-700">{role.role}</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{role.count} staff</div>
                    <div className="text-xs text-slate-500">₹{role.avgSalary.toLocaleString()}/mo</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Equipment Utilization Analytics */}
      <Card
        title="Equipment Utilization Analytics"
        subtitle="Equipment performance and ROI analysis across all locations"
        icon={Award}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-800">{analytics.equipmentUtilization.totalEquipment}</div>
            <div className="text-sm text-blue-600">Total Equipment</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-800">{analytics.equipmentUtilization.avgUtilization}%</div>
            <div className="text-sm text-green-600">Avg Utilization</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-800">{analytics.equipmentUtilization.maintenanceDue}</div>
            <div className="text-sm text-yellow-600">Maintenance Due</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-800">
              {Math.round(analytics.equipmentUtilization.equipmentByCategory.reduce((sum, cat) => sum + cat.roi, 0) / analytics.equipmentUtilization.equipmentByCategory.length)}%
            </div>
            <div className="text-sm text-purple-600">Avg ROI</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-medium text-slate-600">Category</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Count</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Utilization</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">ROI</th>
                <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.equipmentUtilization.equipmentByCategory.map((category, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-800">{category.category}</td>
                  <td className="py-3 px-4 text-slate-600">{category.count}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${category.utilization >= 80 ? 'bg-green-600' : category.utilization >= 60 ? 'bg-yellow-600' : 'bg-red-600'}`}
                          style={{ width: `${category.utilization}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{category.utilization}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-medium ${category.roi >= 15 ? 'text-green-600' : category.roi >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {category.roi}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={
                      category.utilization >= 80 && category.roi >= 15 ? 'success' :
                      category.utilization >= 60 && category.roi >= 10 ? 'warning' : 'danger'
                    }>
                      {category.utilization >= 80 && category.roi >= 15 ? 'Optimal' :
                       category.utilization >= 60 && category.roi >= 10 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}