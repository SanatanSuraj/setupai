"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import {
  FileText,
  CheckCircle2,
  X,
  Zap,
  ChevronRight,
} from "lucide-react";
import {
  getSampleOrders,
  createSampleOrder,
  updateOrderStatus,
  type SampleOrder,
} from "@/services/operationsService";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_FLOW = [
  "collected",
  "testing",
  "qc",
  "report_generated",
  "delivered",
] as const;

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 animate-pulse">
          <div className="h-7 w-56 bg-slate-200 rounded-full" />
          <div className="h-4 w-72 bg-slate-100 rounded-full" />
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="h-9 w-9 bg-slate-200 rounded-lg" />
          <div className="h-4 w-48 bg-slate-200 rounded-full" />
        </div>
        <div className="p-6 space-y-3">
          {[85, 75, 65, 55].map((w) => (
            <div key={w} className="h-4 bg-slate-100 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function OperationsPage() {
  const [orders, setOrders] = useState<SampleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action dropdown state — tracks which order row has its dropdown open
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Add-sample form state
  const [showForm, setShowForm] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [testDropdownOpen, setTestDropdownOpen] = useState(false);

  const TEST_OPTIONS = [
    { value: "CBC", label: "Complete Blood Count" },
    { value: "Blood Sugar", label: "Blood Sugar" },
    { value: "Lipid Profile", label: "Lipid Profile" },
    { value: "Liver Function", label: "Liver Function Test" },
    { value: "Kidney Function", label: "Kidney Function Test" },
    { value: "Urine Routine", label: "Urine Routine" },
    { value: "Thyroid Profile", label: "Thyroid Profile" },
    { value: "HbA1c", label: "HbA1c" },
    { value: "Vitamin D", label: "Vitamin D" },
    { value: "Iron Studies", label: "Iron Studies" },
  ];

  const toggleTest = (value: string) => {
    setSelectedTests((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  // ── Data Fetching ────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ordersData = await getSampleOrders();
      setOrders(ordersData);
    } catch {
      setError("Failed to load operations data. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + 60-second auto-refresh
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Mutations ────────────────────────────────────────────────────────────────
  const addOrder = async () => {
    try {
      const testTypeStr =
        selectedTests.length > 0 ? selectedTests.join(", ") : "General";
      const newOrder = await createSampleOrder(
        patientName || "Patient",
        testTypeStr
      );
      setOrders((prev) => [newOrder, ...prev]);
      setShowForm(false);
      setPatientName("");
      setSelectedTests([]);
      setTestDropdownOpen(false);
    } catch {
      setError("Failed to create sample order.");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch {
      setError("Failed to update order status.");
    }
  };

  // ── Loading State ────────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-6 p-6 md:p-8">

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Operations Dashboard
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Track samples through the complete workflow
          </p>
        </div>
      </div>

      {/* Sample Order Management */}
      <Card
        title="Sample Order Management"
        subtitle="Track samples through the complete workflow"
        icon={FileText}
          action={
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setTestDropdownOpen(false);
              if (showForm) {
                setPatientName("");
                setSelectedTests([]);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold"
          >
            {showForm ? "Cancel" : "+ New Sample"}
          </button>
        }
      >
        <div className="space-y-4">
          {showForm && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter patient name"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Test Type{" "}
                    {selectedTests.length > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black">
                        {selectedTests.length}
                      </span>
                    )}
                  </label>
                  {/* Trigger button */}
                  <button
                    type="button"
                    onClick={() => setTestDropdownOpen((o) => !o)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <span className={selectedTests.length === 0 ? "text-slate-400" : "text-slate-800 font-medium truncate"}>
                      {selectedTests.length === 0
                        ? "Select tests…"
                        : selectedTests
                            .map((v) => TEST_OPTIONS.find((o) => o.value === v)?.label ?? v)
                            .join(", ")}
                    </span>
                    <svg
                      className={`ml-2 h-4 w-4 shrink-0 text-slate-500 transition-transform ${testDropdownOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown panel */}
                  {testDropdownOpen && (
                    <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                      {/* Select all / Clear */}
                      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => setSelectedTests(TEST_OPTIONS.map((o) => o.value))}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          Select all
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTests([])}
                          className="text-xs font-bold text-slate-500 hover:text-slate-700"
                        >
                          Clear
                        </button>
                      </div>

                      {/* Options */}
                      <ul className="max-h-52 overflow-y-auto py-1">
                        {TEST_OPTIONS.map((opt) => {
                          const checked = selectedTests.includes(opt.value);
                          return (
                            <li key={opt.value}>
                              <button
                                type="button"
                                onClick={() => toggleTest(opt.value)}
                                className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-blue-50 transition-colors ${checked ? "bg-blue-50/60" : ""}`}
                              >
                                <span
                                  className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                                    checked ? "bg-blue-600 border-blue-600" : "border-slate-300"
                                  }`}
                                >
                                  {checked && (
                                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </span>
                                <span className={checked ? "font-semibold text-slate-800" : "text-slate-600"}>
                                  {opt.label}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={addOrder}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold"
              >
                Add Sample Order
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                <Zap size={14} />
                Workflow: Collected → Testing → QC → Report Generated → Delivered
              </p>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {["Patient", "Test Type", "Status", "TAT", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-slate-400 text-sm"
                    >
                      No sample orders yet. Click &ldquo;+ New Sample&rdquo; to add one.
                    </td>
                  </tr>
                )}
                {orders.map((order) => {
                  const idx = STATUS_FLOW.indexOf(
                    order.status as (typeof STATUS_FLOW)[number]
                  );
                  const nextStatus =
                    idx >= 0 && idx < STATUS_FLOW.length - 1
                      ? STATUS_FLOW[idx + 1]
                      : null;
                  // Use actual TAT from the order — no Math.random()
                  const tatHours = order.TAT;

                  return (
                    <tr
                      key={order._id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {order.patientName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{order.testType}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "success"
                              : order.status === "report_generated"
                              ? "info"
                              : order.status === "qc"
                              ? "warning"
                              : order.status === "testing"
                              ? "purple"
                              : "slate"
                          }
                        >
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {tatHours != null ? (
                          <span
                            className={`text-sm font-bold ${
                              tatHours <= 24
                                ? "text-emerald-600"
                                : tatHours <= 48
                                ? "text-amber-600"
                                : "text-rose-600"
                            }`}
                          >
                            {tatHours}h
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {nextStatus ? (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenActionId((prev) =>
                                  prev === order._id ? null : order._id
                                )
                              }
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                            >
                              {nextStatus.replace(/_/g, " ")}
                              <ChevronRight size={13} className="text-slate-400" />
                            </button>

                            {openActionId === order._id && (
                              <>
                                {/* backdrop to close on outside click */}
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenActionId(null)}
                                />
                                <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                      Advance Status
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      updateStatus(order._id, nextStatus);
                                      setOpenActionId(null);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-blue-700 font-semibold hover:bg-blue-50 transition-colors"
                                  >
                                    <span className="flex items-center gap-2">
                                      <CheckCircle2 size={14} />
                                      {nextStatus.replace(/_/g, " ")}
                                    </span>
                                    <ChevronRight size={14} className="text-blue-400" />
                                  </button>
                                  {/* All remaining steps */}
                                  {STATUS_FLOW.slice(idx + 2).map((step) => (
                                    <button
                                      key={step}
                                      onClick={() => {
                                        updateStatus(order._id, step);
                                        setOpenActionId(null);
                                      }}
                                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                    >
                                      <span className="flex items-center gap-2">
                                        <ChevronRight size={14} className="text-slate-400" />
                                        {step.replace(/_/g, " ")}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold">
                            ✓ Complete
                          </span>
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
