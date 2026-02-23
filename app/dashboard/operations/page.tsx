"use client";

import { useEffect, useState } from "react";

interface SampleOrder {
  _id: string;
  patientName: string;
  testType: string;
  status: string;
  TAT?: number;
  collectedAt?: string;
  createdAt: string;
}

const STATUS_FLOW = ["collected", "testing", "qc", "report_generated", "delivered"] as const;

export default function OperationsPage() {
  const [orders, setOrders] = useState<SampleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [testType, setTestType] = useState("");

  useEffect(() => {
    fetch("/api/operations/orders")
      .then((r) => r.json())
      .then(setOrders)
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
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground">Operations</h1>
      <p className="mt-1 text-muted-foreground">Sample tracking: Collected → Testing → QC → Report → Delivered. TAT monitoring.</p>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {showForm ? "Cancel" : "+ New sample order"}
      </button>
      {showForm && (
        <div className="mt-4 max-w-md rounded-xl border border-border bg-card p-4">
          <label className="block text-sm font-medium text-foreground">Patient name</label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
          <label className="mt-3 block text-sm font-medium text-foreground">Test type</label>
          <input
            type="text"
            value={testType}
            onChange={(e) => setTestType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
          <button
            onClick={addOrder}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add order
          </button>
        </div>
      )}
      <div className="mt-6 overflow-x-auto">
        <p className="text-sm text-muted-foreground mb-2">Status flow: Collected → Testing → QC → Report Generated → Delivered</p>
        <table className="w-full border-collapse rounded-lg border border-border">
          <thead>
            <tr className="bg-muted/50">
              <th className="border-b border-border px-4 py-2 text-left text-sm font-medium text-foreground">Patient</th>
              <th className="border-b border-border px-4 py-2 text-left text-sm font-medium text-foreground">Test</th>
              <th className="border-b border-border px-4 py-2 text-left text-sm font-medium text-foreground">Status</th>
              <th className="border-b border-border px-4 py-2 text-left text-sm font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">No orders yet.</td></tr>
            )}
            {orders.map((order) => {
              const idx = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);
              const nextStatus = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
              return (
                <tr key={order._id} className="border-b border-border">
                  <td className="px-4 py-2 text-foreground">{order.patientName}</td>
                  <td className="px-4 py-2 text-muted-foreground">{order.testType}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {nextStatus && (
                      <button
                        onClick={() => updateStatus(order._id, nextStatus)}
                        className="text-sm text-primary hover:underline"
                      >
                        → {nextStatus}
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
  );
}
