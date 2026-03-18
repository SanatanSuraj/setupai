// ─── Operations Dashboard Service ────────────────────────────────────────────
// Centralised typed fetch wrappers for the Operations Dashboard.
// All API endpoints already exist — this layer adds typed return values,
// error handling, and a single place to swap to a real data source later.

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SampleTrackingMetrics {
  dailyVolume: number;
  tatCompliance: number;
  rejectionRate: number;
  avgTAT: number;
}

export interface BmwTrackingMetrics {
  monthlyGeneration: number;
  disposalCompliance: boolean;
  nextPickupDate: string;
  /** Extensible: keys are category names (yellow, red, white, blue, …) */
  wasteCategories: Record<string, number>;
}

export interface StaffMetrics {
  attendance: number;
  productivity: number;
  trainingCompliance: number;
}

export interface FinancialMetrics {
  dailyRevenue: number;
  costPerTest: number;
  profitMargin: number;
}

export interface OperationsMetrics {
  sampleTracking: SampleTrackingMetrics;
  bmwTracking: BmwTrackingMetrics;
  staffMetrics: StaffMetrics;
  financialMetrics: FinancialMetrics;
}

export interface SampleOrder {
  _id: string;
  patientName: string;
  testType: string;
  status: string;
  TAT?: number;
  collectedAt?: string;
  createdAt: string;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/** Fetch combined operations metrics from the backend. */
export async function getOperationsMetrics(): Promise<OperationsMetrics | null> {
  const res = await fetch("/api/operations/metrics", { cache: "no-store" });
  if (!res.ok) throw new Error(`Metrics fetch failed: ${res.status}`);
  const data = await res.json();
  return data?.sampleTracking ? (data as OperationsMetrics) : null;
}

/** Fetch the latest 50 sample orders. */
export async function getSampleOrders(): Promise<SampleOrder[]> {
  const res = await fetch("/api/operations/orders", { cache: "no-store" });
  if (!res.ok) throw new Error(`Orders fetch failed: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/** Create a new sample order. */
export async function createSampleOrder(
  patientName: string,
  testType: string
): Promise<SampleOrder> {
  const res = await fetch("/api/operations/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ patientName, testType }),
  });
  if (!res.ok) throw new Error(`Create order failed: ${res.status}`);
  return res.json();
}

/** Advance a sample order to the next status. */
export async function updateOrderStatus(
  id: string,
  status: string
): Promise<SampleOrder> {
  const res = await fetch(`/api/operations/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Update order failed: ${res.status}`);
  return res.json();
}
