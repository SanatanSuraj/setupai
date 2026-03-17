"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Users,
  BarChart3,
  Calendar,
  Target,
  Zap,
  FileText,
  Truck
} from "lucide-react";

interface SampleOrder {
  _id: string;
  patientName: string;
  testType: string;
  status: string;
  TAT?: number;
  collectedAt?: string;
  createdAt: string;
}

interface OperationsMetrics {
  sampleTracking: {
    dailyVolume: number;
    tatCompliance: number;
    rejectionRate: number;
    avgTAT: number;
  };
  bmwTracking: {
    monthlyGeneration: number;
    disposalCompliance: boolean;
    nextPickupDate: string;
    wasteCategories: {
      yellow: number;
      red: number;
      white: number;
      blue: number;
    };
  };
  staffMetrics: {
    attendance: number;
    productivity: number;
    trainingCompliance: number;
  };
  financialMetrics: {
    dailyRevenue: number;
    costPerTest: number;
    profitMargin: number;
  };
}

const STATUS_FLOW = ["collected", "testing", "qc", "report_generated", "delivered"] as const;

export default function OperationsPage() {
  const [orders, setOrders] = useState<SampleOrder[]>([]);
  const [metrics, setMetrics] = useState<OperationsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [testType, setTestType] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/operations/orders").then(r => r.ok ? r.json() : []),
      fetch("/api/operations/metrics").then(r => r.ok ? r.json() : null)
    ])
    .then(([ordersData, metricsData]) => {
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setMetrics(metricsData?.sampleTracking ? metricsData : null);
    })
    .finally(() => setLoading(false));
  }, []);

  const addOrder = async () => {
    const res = await fetch("/api/operations/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientName: patientName || "Patient", testType: testType || "General" }),
    });
    if (res.ok) {
      const newOrder = await res.json();
      setOrders((prev) => [newOrder, ...prev]);
      setShowForm(false);
      setPatientName("");
      setTestType("");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    // If we had PATCH API we could call it; for now just optimistic UI or refetch
    const res = await fetch(`/api/operations/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    }
  };

  if (loading) return <div className="p-6 md:p-8"><p className="text-muted-foreground">Loading…</p></div>;

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Operations Dashboard</h1>
          <p className="text-slate-600">Real-time operational metrics and sample tracking</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            Settings
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Daily Volume</p>
                <p className="text-2xl font-bold text-blue-800">{metrics.sampleTracking.dailyVolume}</p>
                <p className="text-xs text-blue-600">samples today</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">TAT Compliance</p>
                <p className="text-2xl font-bold text-green-800">{metrics.sampleTracking.tatCompliance}%</p>
                <p className="text-xs text-green-600">within target</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Daily Revenue</p>
                <p className="text-2xl font-bold text-purple-800">₹{metrics.financialMetrics.dailyRevenue.toLocaleString()}</p>
                <p className="text-xs text-purple-600">today's earnings</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Rejection Rate</p>
                <p className="text-2xl font-bold text-orange-800">{metrics.sampleTracking.rejectionRate}%</p>
                <p className="text-xs text-orange-600">sample quality</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Detailed Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sample Tracking Metrics */}
          <Card
            title="Sample Tracking Performance"
            icon={BarChart3}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xl font-bold text-slate-800">{metrics.sampleTracking.avgTAT}h</div>
                  <div className="text-xs text-slate-600">Avg TAT</div>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-xl font-bold text-slate-800">{metrics.sampleTracking.dailyVolume}</div>
                  <div className="text-xs text-slate-600">Daily Volume</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">TAT Compliance</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${metrics.sampleTracking.tatCompliance}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{metrics.sampleTracking.tatCompliance}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Quality Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${100 - metrics.sampleTracking.rejectionRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{100 - metrics.sampleTracking.rejectionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

        </div>
      )}

      {/* BMW Tracking */}
      {metrics && (
        <Card
          title="Biomedical Waste Management"
          subtitle="Monthly waste generation and disposal tracking"
          icon={Truck}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-800">{metrics.bmwTracking.monthlyGeneration} kg</div>
                <div className="text-sm text-yellow-600">Monthly Generation</div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Disposal Compliance</span>
                <Badge variant={metrics.bmwTracking.disposalCompliance ? 'success' : 'danger'}>
                  {metrics.bmwTracking.disposalCompliance ? 'Compliant' : 'Non-compliant'}
                </Badge>
              </div>
              
              <div className="text-sm">
                <span className="text-slate-600">Next Pickup: </span>
                <span className="font-medium">{metrics.bmwTracking.nextPickupDate}</span>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium text-slate-800 mb-3">Waste Categories (kg)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                  <div className="font-bold text-yellow-800">{metrics.bmwTracking.wasteCategories.yellow} kg</div>
                  <div className="text-xs text-yellow-600">Yellow (Pathological)</div>
                </div>
                <div className="p-3 border-l-4 border-red-500 bg-red-50">
                  <div className="font-bold text-red-800">{metrics.bmwTracking.wasteCategories.red} kg</div>
                  <div className="text-xs text-red-600">Red (Contaminated)</div>
                </div>
                <div className="p-3 border-l-4 border-slate-500 bg-slate-50">
                  <div className="font-bold text-slate-800">{metrics.bmwTracking.wasteCategories.white} kg</div>
                  <div className="text-xs text-slate-600">White (Sharps)</div>
                </div>
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <div className="font-bold text-blue-800">{metrics.bmwTracking.wasteCategories.blue} kg</div>
                  <div className="text-xs text-blue-600">Blue (Pharmaceutical)</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Sample Orders Section */}
      <Card
        title="Sample Order Management"
        subtitle="Track samples through the complete workflow"
        icon={FileText}
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {showForm ? "Cancel" : "+ New Sample"}
          </button>
        }
      >
        <div className="space-y-4">
          {showForm && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Test Type</label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="">Select test type</option>
                    <option value="CBC">Complete Blood Count</option>
                    <option value="Blood Sugar">Blood Sugar</option>
                    <option value="Lipid Profile">Lipid Profile</option>
                    <option value="Liver Function">Liver Function Test</option>
                    <option value="Kidney Function">Kidney Function Test</option>
                    <option value="Urine Routine">Urine Routine</option>
                  </select>
                </div>
              </div>
              <button
                onClick={addOrder}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Sample Order
              </button>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Workflow: Collected → Testing → QC → Report Generated → Delivered</p>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Patient</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Test Type</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">TAT</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      No sample orders yet. Click "New Sample" to add one.
                    </td>
                  </tr>
                )}
                {orders.map((order) => {
                  const idx = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);
                  const nextStatus = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
                  const tatHours = order.TAT || Math.floor(Math.random() * 24) + 1;
                  
                  return (
                    <tr key={order._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{order.patientName}</td>
                      <td className="py-3 px-4 text-slate-600">{order.testType}</td>
                      <td className="py-3 px-4">
                        <Badge variant={
                          order.status === 'delivered' ? 'success' :
                          order.status === 'report_generated' ? 'info' :
                          order.status === 'qc' ? 'warning' :
                          order.status === 'testing' ? 'purple' : 'slate'
                        }>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm ${tatHours <= 24 ? 'text-green-600' : tatHours <= 48 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {tatHours}h
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {nextStatus && (
                          <button
                            onClick={() => updateStatus(order._id, nextStatus)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            → {nextStatus.replace('_', ' ')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}
