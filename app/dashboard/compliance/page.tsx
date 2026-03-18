"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Flame,
  Leaf,
  FileText,
  Award,
  Briefcase,
  Receipt,
  Building2,
  Zap,
  Users,
  Wrench,
  Clock,
  ArrowRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReadinessData {
  canGoLive: boolean;
  overallCompletion: number;
  totalGates: number;
  passedGates: number;
  criticalBlockers: number;
  bmwStatus: {
    exists: boolean;
    status: string;
    canProceed: boolean;
    isExpired: boolean;
    isRenewalDue: boolean;
    expiryDate?: string;
  };
  blockers: Array<{
    name: string;
    type: string;
    reason: string;
    actionRequired: string;
  }>;
  gates: {
    compliance: Gate[];
    goLive: Gate[];
  };
}

interface Gate {
  _id: string;
  gateType: string;
  name?: string;
  status: string;
  hardGate?: boolean;
  isHardGate?: boolean;
  blockingReason?: string;
  actionRequired?: string;
  applicationDetails?: {
    applicationNumber?: string;
    submittedDate?: string;
    approvalDate?: string;
    expiryDate?: string;
    authority?: string;
    fees?: number;
  };
  documents?: Array<{ name: string; url?: string }>;
  lastUpdated?: string;
}

interface ValidationReport {
  overallScore: number;
  canGoLive: boolean;
  criticalIssues: string[];
  gateStatus: { total: number; completed: number; pending: number; blocked: number };
  validations: {
    bmw: ValidationResult;
    cea: ValidationResult;
    staffing: ValidationResult;
    equipment: ValidationResult;
  };
  estimatedTimeToGoLive: number;
  nextActions: Array<{ action: string; priority: "high" | "medium" | "low"; estimatedDays: number }>;
}

interface ValidationResult {
  isCompliant: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  requiredActions: string[];
  estimatedCompletionDays?: number;
}

type FilterTab = "all" | "pending" | "passed" | "critical";
type Toast = { id: number; message: string; type: "success" | "error" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const GATE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  bmw_authorization:     { label: "BMW Authorization",        icon: Leaf,      color: "text-emerald-600" },
  cea_approval:          { label: "CEA Registration",         icon: Building2, color: "text-blue-600" },
  fire_noc:              { label: "Fire Safety NOC",          icon: Flame,     color: "text-orange-500" },
  nabl_readiness:        { label: "NABL Readiness",           icon: Award,     color: "text-amber-600" },
  trade_license:         { label: "Trade License",            icon: Briefcase, color: "text-violet-600" },
  gst_registration:      { label: "GST Registration",         icon: Receipt,   color: "text-indigo-600" },
  shop_establishment:    { label: "Shop Establishment",       icon: Building2, color: "text-sky-600" },
  pollution_control:     { label: "Pollution Control Board",  icon: Zap,       color: "text-teal-600" },
  staff_training:        { label: "Staff Training",           icon: Users,     color: "text-pink-600" },
  equipment_calibration: { label: "Equipment Calibration",   icon: Wrench,    color: "text-rose-600" },
  pathologist_onboard:   { label: "Pathologist Onboard",      icon: Users,     color: "text-purple-600" },
  quality_manual:        { label: "Quality Manual",           icon: FileText,  color: "text-slate-600" },
  lims_integration:      { label: "LIMS Integration",         icon: Zap,       color: "text-cyan-600" },
  internal_audit:        { label: "Internal Audit",           icon: ShieldCheck, color: "text-slate-600" },
  sample_collection_sops:{ label: "Sample Collection SOPs",   icon: FileText,  color: "text-indigo-500" },
  insurance_policies:    { label: "Insurance Policies",       icon: ShieldCheck, color: "text-violet-500" },
};

const gateLabel = (type: string, name?: string) =>
  GATE_META[type]?.label ?? name ?? type.replace(/_/g, " ");

const gateIcon  = (type: string) => GATE_META[type]?.icon  ?? ShieldCheck;
const gateColor = (type: string) => GATE_META[type]?.color ?? "text-slate-500";

const complianceStatusVariant = (s: string): "success" | "info" | "warning" | "danger" | "slate" => {
  if (s === "approved" || s === "passed") return "success";
  if (s === "in_progress" || s === "submitted") return "info";
  if (s === "pending") return "warning";
  if (s === "rejected" || s === "expired" || s === "failed") return "danger";
  return "slate";
};

const priorityVariant = (p: string): "danger" | "warning" | "info" => {
  if (p === "high" || p === "critical") return "danger";
  if (p === "medium") return "warning";
  return "info";
};

const scoreRing = (score: number) => {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-rose-600";
};

/** Tailwind classes for the inline status dropdown colour */
const statusSelectCls = (s: string) => {
  if (s === "approved" || s === "passed")
    return "border-emerald-200 text-emerald-700 bg-emerald-50";
  if (s === "in_progress")
    return "border-blue-200 text-blue-700 bg-blue-50";
  if (s === "pending")
    return "border-amber-200 text-amber-700 bg-amber-50";
  if (s === "rejected" || s === "expired" || s === "failed")
    return "border-rose-200 text-rose-700 bg-rose-50";
  return "border-slate-200 text-slate-600 bg-white";
};

const COMPLIANCE_STATUS_OPTIONS = [
  { value: "pending",     label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "approved",    label: "Approved" },
  { value: "rejected",    label: "Rejected" },
  { value: "expired",     label: "Expired" },
];

const GOLIVE_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "passed",  label: "Passed" },
  { value: "failed",  label: "Failed" },
];

const FILTER_LABELS: Record<FilterTab, string> = {
  all:      "All",
  pending:  "Pending",
  passed:   "Passed",
  critical: "Critical",
};

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim",
  "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

const LAB_TYPES = [
  { value: "basic",      label: "Basic Lab" },
  { value: "medium",     label: "Medium Lab" },
  { value: "advanced",   label: "Advanced Lab" },
  { value: "clinic_lab", label: "Clinic Lab" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CompliancePage() {

  // ── Existing server-state (UNCHANGED) ────────────────────────────────────────
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [report, setReport]       = useState<ValidationReport | null>(null);
  const [loadingReadiness, setLoadingReadiness] = useState(true);
  const [validating,       setValidating]       = useState(false);
  const [initializingGates, setInitializingGates] = useState(false);

  // BMW form (UNCHANGED)
  const [showBMWForm, setShowBMWForm] = useState(false);
  const [bmwTab, setBmwTab] = useState<"submit" | "update">("submit");
  const [bmwForm, setBmwForm] = useState({
    applicationNumber: "", authority: "", submittedDate: "",
    fees: "", cbwtfVendor: "", cbwtfContact: "",
  });
  const [bmwUpdateForm, setBmwUpdateForm] = useState({
    status: "approved", approvalDate: "", expiryDate: "", authorizationNumber: "",
  });
  const [bmwLoading, setBmwLoading]   = useState(false);
  const [bmwMessage, setBmwMessage]   = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Gate init form (UNCHANGED)
  const [showInitForm,  setShowInitForm]  = useState(false);
  const [initState,     setInitState]     = useState("Maharashtra");
  const [initLabType,   setInitLabType]   = useState("basic");
  const [initDistrict,  setInitDistrict]  = useState("");
  const [initMessage,   setInitMessage]   = useState<string | null>(null);

  // Expand & error (UNCHANGED)
  const [expandedGate, setExpandedGate] = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);

  // ── NEW state ─────────────────────────────────────────────────────────────────
  // Optimistic local overrides: { [gate._id]: newStatus }
  const [localOverrides, setLocalOverrides] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("compliance-gate-overrides") ?? "{}"); }
    catch { return {}; }
  });
  const [updatingGate, setUpdatingGate] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [toasts,       setToasts]       = useState<Toast[]>([]);

  // ── Persist overrides to localStorage ────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem("compliance-gate-overrides", JSON.stringify(localOverrides)); }
    catch {}
  }, [localOverrides]);

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const addToast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  // ── fetchReadiness (enhanced: silent mode + clears overrides) ─────────────────
  const fetchReadiness = useCallback(async (silent = false) => {
    if (!silent) setLoadingReadiness(true);
    setError(null);
    try {
      const res = await fetch("/api/compliance/readiness");
      if (res.ok) {
        const data = await res.json();
        setReadiness(data);
        // Server data is now authoritative — clear optimistic overrides
        setLocalOverrides({});
        try { localStorage.removeItem("compliance-gate-overrides"); } catch {}
      }
    } catch {
      setError("Failed to load compliance data.");
    } finally {
      if (!silent) setLoadingReadiness(false);
    }
  }, []);

  useEffect(() => { fetchReadiness(); }, [fetchReadiness]);

  // ── Existing handlers (UNCHANGED logic, use silent refresh) ──────────────────
  const runValidation = async () => {
    setValidating(true);
    setError(null);
    try {
      const res = await fetch("/api/compliance/validate", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setReport(data.complianceReport ?? null);
        addToast("Validation complete");
      } else {
        const d = await res.json().catch(() => null);
        setError(d?.error ?? "Validation failed.");
      }
    } catch {
      setError("Failed to run compliance validation.");
    } finally {
      setValidating(false);
    }
  };

  const submitBMW = async () => {
    setBmwLoading(true);
    setBmwMessage(null);
    try {
      const res = await fetch("/api/compliance/bmw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationNumber: bmwForm.applicationNumber,
          authority:         bmwForm.authority,
          submittedDate:     bmwForm.submittedDate,
          fees:              bmwForm.fees ? Number(bmwForm.fees) : undefined,
          cbwtfContract:     { vendor: bmwForm.cbwtfVendor, contact: bmwForm.cbwtfContact },
        }),
      });
      if (res.ok) {
        setBmwMessage({ type: "success", text: "BMW application submitted successfully." });
        setShowBMWForm(false);
        addToast("BMW application submitted");
        fetchReadiness(true);
      } else {
        const d = await res.json().catch(() => null);
        setBmwMessage({ type: "error", text: d?.error ?? "Failed to submit BMW application." });
      }
    } catch {
      setBmwMessage({ type: "error", text: "Network error." });
    } finally {
      setBmwLoading(false);
    }
  };

  const updateBMWStatus = async () => {
    setBmwLoading(true);
    setBmwMessage(null);
    try {
      const res = await fetch("/api/compliance/bmw", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status:              bmwUpdateForm.status,
          approvalDate:        bmwUpdateForm.approvalDate || undefined,
          expiryDate:          bmwUpdateForm.expiryDate   || undefined,
          authorizationNumber: bmwUpdateForm.authorizationNumber || undefined,
        }),
      });
      if (res.ok) {
        const d = await res.json();
        setBmwMessage({ type: "success", text: d.message ?? "BMW status updated." });
        setShowBMWForm(false);
        addToast(d.message ?? "BMW status updated");
        fetchReadiness(true);
      } else {
        const d = await res.json().catch(() => null);
        setBmwMessage({ type: "error", text: d?.error ?? "Failed to update BMW status." });
      }
    } catch {
      setBmwMessage({ type: "error", text: "Network error." });
    } finally {
      setBmwLoading(false);
    }
  };

  const initializeGates = async () => {
    setInitializingGates(true);
    setInitMessage(null);
    try {
      const res = await fetch("/api/compliance/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: initState, labType: initLabType, district: initDistrict || undefined }),
      });
      if (res.ok) {
        setInitMessage("Compliance gates initialized successfully.");
        setShowInitForm(false);
        addToast("Gates initialized — all set to pending");
        fetchReadiness(true);
      } else {
        const d = await res.json().catch(() => null);
        setInitMessage(d?.error ?? "Failed to initialize gates.");
      }
    } catch {
      setInitMessage("Network error.");
    } finally {
      setInitializingGates(false);
    }
  };

  // ── NEW: inline gate status update with optimistic UI ────────────────────────
  const updateGateStatus = useCallback(async (
    gateId: string,
    gateType: string,
    newStatus: string,
    category: "compliance" | "golive",
  ) => {
    const previousOverrides = { ...localOverrides };
    // Optimistic update
    setLocalOverrides(prev => ({ ...prev, [gateId]: newStatus }));
    setUpdatingGate(gateId);
    try {
      const res = await fetch("/api/compliance/gates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gateType, status: newStatus, gateCategory: category }),
      });
      if (res.ok) {
        addToast(`${gateLabel(gateType)} → ${newStatus.replace(/_/g, " ")}`);
        fetchReadiness(true);
      } else {
        setLocalOverrides(previousOverrides); // revert
        const d = await res.json().catch(() => null);
        addToast(d?.error ?? "Update failed", "error");
      }
    } catch {
      setLocalOverrides(previousOverrides);
      addToast("Network error", "error");
    } finally {
      setUpdatingGate(null);
    }
  }, [localOverrides, addToast, fetchReadiness]);

  // ── Computed gate arrays (local overrides merged) ─────────────────────────────
  const rawComplianceGates = readiness?.gates?.compliance ?? [];
  const rawGoLiveGates     = readiness?.gates?.goLive     ?? [];

  const complianceGates = useMemo(
    () => rawComplianceGates.map(g => ({ ...g, status: localOverrides[g._id] ?? g.status })),
    [rawComplianceGates, localOverrides],
  );
  const goLiveGates = useMemo(
    () => rawGoLiveGates.map(g => ({ ...g, status: localOverrides[g._id] ?? g.status })),
    [rawGoLiveGates, localOverrides],
  );

  // ── Derived stats (recomputed instantly on every status change) ───────────────
  const totalGates   = complianceGates.length + goLiveGates.length;
  const passedGates  =
    complianceGates.filter(g => g.status === "approved").length +
    goLiveGates.filter(g => g.status === "passed").length;
  const criticalBlockerGates = [
    ...complianceGates.filter(g => g.hardGate    && g.status !== "approved"),
    ...goLiveGates.filter(g    => g.isHardGate   && g.status !== "passed"),
  ];
  const criticalBlockerCount = criticalBlockerGates.length;
  const overallCompletion    = totalGates > 0
    ? (passedGates / totalGates) * 100
    : (readiness?.overallCompletion ?? 0);
  const canGoLive = criticalBlockerCount === 0 && totalGates > 0;

  // BMW derived (reflects dropdown changes immediately)
  const bmwGateData = complianceGates.find(g => g.gateType === "bmw_authorization");
  const derivedBmwStatus = bmwGateData
    ? {
        ...(readiness?.bmwStatus ?? { exists: false, isExpired: false, isRenewalDue: false, expiryDate: undefined }),
        status:     bmwGateData.status,
        canProceed: bmwGateData.status === "approved",
        exists:     true,
      }
    : readiness?.bmwStatus;

  // Dynamic blockers (recomputed from effective gate statuses)
  const dynamicBlockers = [
    ...complianceGates
      .filter(g => g.hardGate && g.status !== "approved")
      .map(g => ({
        name:           gateLabel(g.gateType, g.name),
        type:           g.gateType,
        reason:         g.blockingReason ?? `${gateLabel(g.gateType)} approval is required for go-live`,
        actionRequired: g.actionRequired ?? `Submit and obtain ${gateLabel(g.gateType)} from the relevant authority`,
      })),
    ...goLiveGates
      .filter(g => g.isHardGate && g.status !== "passed")
      .map(g => ({
        name:           gateLabel(g.gateType, g.name),
        type:           g.gateType,
        reason:         g.blockingReason ?? `${gateLabel(g.gateType, g.name)} must pass before go-live`,
        actionRequired: g.actionRequired ?? `Complete ${gateLabel(g.gateType, g.name)}`,
      })),
  ];

  // ── Filtered gate lists ───────────────────────────────────────────────────────
  const filterGate = (gate: Gate, isGoLive: boolean) => {
    const isHard    = isGoLive ? gate.isHardGate  : gate.hardGate;
    const isCritical = isHard && (isGoLive ? gate.status !== "passed" : gate.status !== "approved");
    if (activeFilter === "passed")   return isGoLive ? gate.status === "passed"   : gate.status === "approved";
    if (activeFilter === "pending")  return gate.status === "pending" || gate.status === "in_progress";
    if (activeFilter === "critical") return !!isCritical;
    return true;
  };

  const filteredComplianceGates = complianceGates.filter(g => filterGate(g, false));
  const filteredGoLiveGates     = goLiveGates.filter(g     => filterGate(g, true));
  const hasGates = complianceGates.length > 0 || goLiveGates.length > 0;

  // Filter tab counts
  const filterCounts: Record<FilterTab, number> = {
    all:      complianceGates.length + goLiveGates.length,
    pending:  complianceGates.filter(g => g.status === "pending" || g.status === "in_progress").length +
              goLiveGates.filter(g    => g.status === "pending").length,
    passed:   complianceGates.filter(g => g.status === "approved").length +
              goLiveGates.filter(g    => g.status === "passed").length,
    critical: criticalBlockerCount,
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loadingReadiness) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <div className="h-8 w-64 bg-slate-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">

      {/* ── Toast Notifications ── */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-xl shadow-lg text-sm font-semibold pointer-events-auto flex items-center gap-2 animate-in slide-in-from-right-4 fade-in duration-200 ${
              t.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            {t.type === "success"
              ? <CheckCircle2 size={15} className="shrink-0" />
              : <XCircle      size={15} className="shrink-0" />}
            {t.message}
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Compliance Center</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium mt-0.5">
            Track regulatory gates, BMW authorization, and go-live readiness.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowInitForm(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center gap-2"
          >
            <Zap size={16} /> Initialize Gates
          </button>
          <button
            onClick={runValidation}
            disabled={validating}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
          >
            <RefreshCw size={16} className={validating ? "animate-spin" : ""} />
            {validating ? "Validating…" : "Run Validation"}
          </button>
        </div>
      </div>

      {/* ── Errors / Messages ── */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" /> {error}
        </div>
      )}
      {initMessage && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium flex items-center gap-2 ${
          initMessage.includes("success") || initMessage.includes("successfully")
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-rose-700"
        }`}>
          {initMessage.includes("success")
            ? <CheckCircle2 size={15} className="shrink-0" />
            : <AlertTriangle size={15} className="shrink-0" />}
          {initMessage}
        </div>
      )}
      {bmwMessage && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
          bmwMessage.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-rose-700"
        }`}>
          {bmwMessage.text}
        </div>
      )}

      {/* ── Go-Live Readiness Banner (computed values) ── */}
      {readiness && (
        <div className={`rounded-2xl border p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          canGoLive
            ? "bg-emerald-50 border-emerald-200"
            : criticalBlockerCount > 0
              ? "bg-rose-50 border-rose-200"
              : "bg-amber-50 border-amber-200"
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${
              canGoLive ? "bg-emerald-100" : criticalBlockerCount > 0 ? "bg-rose-100" : "bg-amber-100"
            }`}>
              {canGoLive
                ? <CheckCircle2 size={28} className="text-emerald-600" />
                : criticalBlockerCount > 0
                  ? <XCircle      size={28} className="text-rose-600" />
                  : <AlertTriangle size={28} className="text-amber-600" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                {canGoLive
                  ? "Ready to Go Live!"
                  : `${criticalBlockerCount} Critical Blocker${criticalBlockerCount !== 1 ? "s" : ""}`}
              </h2>
              <p className="text-sm text-slate-600">
                {passedGates} of {totalGates} gates passed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-black text-slate-800">{Math.round(overallCompletion)}%</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Overall</p>
            </div>
            <div className="w-32">
              <div className="w-full bg-white/60 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    canGoLive ? "bg-emerald-500" : criticalBlockerCount > 0 ? "bg-rose-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${overallCompletion}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Row (computed values) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Gates</p>
          <p className="text-2xl font-black text-slate-800">{readiness ? totalGates : "—"}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passed</p>
          <p className="text-2xl font-black text-emerald-600">{readiness ? passedGates : "—"}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Critical Blockers</p>
          <p className={`text-2xl font-black ${criticalBlockerCount > 0 ? "text-rose-600" : "text-slate-300"}`}>
            {readiness ? criticalBlockerCount : "—"}
          </p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">BMW Status</p>
          <p className={`text-sm font-black mt-1 capitalize ${
            derivedBmwStatus?.canProceed ? "text-emerald-600" : "text-rose-600"
          }`}>
            {derivedBmwStatus?.status?.replace(/_/g, " ") ?? "Not Started"}
          </p>
        </div>
      </div>

      {/* ── Validation Report ── */}
      {report && (
        <Card title="Compliance Validation Report" icon={ShieldCheck}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-black text-slate-800">
                  {Math.round(report.overallScore)}
                  <span className="text-lg text-slate-400">/100</span>
                </p>
                <p className="text-xs text-slate-500 font-medium">Overall Compliance Score</p>
              </div>
              <Badge variant={report.canGoLive ? "success" : "danger"}>
                {report.canGoLive ? "Can Go Live" : "Blocked"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["bmw", "cea", "staffing", "equipment"] as const).map(key => {
                const v = report.validations[key];
                return (
                  <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{key.toUpperCase()}</p>
                    <p className={`text-2xl font-black ${scoreRing(v.score)}`}>{Math.round(v.score)}</p>
                    <Badge variant={v.isCompliant ? "success" : "danger"}>
                      {v.isCompliant ? "Compliant" : "Non-Compliant"}
                    </Badge>
                  </div>
                );
              })}
            </div>

            {report.criticalIssues.length > 0 && (
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-2">Critical Issues</p>
                <ul className="space-y-1.5">
                  {report.criticalIssues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2 border border-rose-100">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {report.nextActions.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Next Actions</p>
                <ul className="space-y-2">
                  {report.nextActions.slice(0, 5).map((action, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Badge variant={priorityVariant(action.priority)}>{action.priority}</Badge>
                      <span className="text-slate-700 flex-1">{action.action}</span>
                      <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock size={12} /> ~{action.estimatedDays}d
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-slate-400">
              Estimated time to go-live:{" "}
              <span className="font-bold text-slate-600">{report.estimatedTimeToGoLive} days</span>
            </p>
          </div>
        </Card>
      )}

      {/* ── Gate Filter Tabs ── */}
      {hasGates && (
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {(Object.keys(FILTER_LABELS) as FilterTab[]).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${
                activeFilter === f
                  ? "bg-white shadow text-slate-800"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {FILTER_LABELS[f]}
              {f === "critical" && filterCounts.critical > 0 && (
                <span className="ml-1.5 bg-rose-500 text-white rounded-full text-[10px] px-1.5 py-0.5">
                  {filterCounts.critical}
                </span>
              )}
              {f !== "critical" && (
                <span className="ml-1.5 text-slate-400 font-normal">{filterCounts[f]}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Compliance Gates ── */}
      {hasGates ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left column: Regulatory Gates + BMW Authorization stacked */}
          <div className="flex flex-col gap-6">

          {/* Regulatory Compliance Gates */}
          <Card title="Regulatory Compliance Gates" icon={ShieldCheck}>
            <div className="space-y-2">
              {filteredComplianceGates.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  {activeFilter === "all" ? "No compliance gates initialized yet." : `No ${activeFilter} compliance gates.`}
                </p>
              ) : (
                filteredComplianceGates.map(gate => {
                  const GIcon    = gateIcon(gate.gateType);
                  const isExpanded = expandedGate === `c-${gate._id}`;
                  const isUpdating = updatingGate === gate._id;
                  return (
                    <div
                      key={gate._id}
                      className={`rounded-xl border transition-all ${
                        isExpanded ? "border-blue-200 bg-blue-50/10" : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div
                        className="p-3 flex items-center justify-between cursor-pointer gap-2"
                        onClick={() => setExpandedGate(isExpanded ? null : `c-${gate._id}`)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {gate.hardGate && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="Hard Gate" />
                          )}
                          <GIcon size={16} className={`shrink-0 ${gateColor(gate.gateType)}`} />
                          <span className="text-sm font-bold text-slate-800 truncate">
                            {gateLabel(gate.gateType, gate.name)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Inline status dropdown */}
                          <select
                            value={gate.status}
                            disabled={isUpdating}
                            onClick={e => e.stopPropagation()}
                            onChange={e => {
                              e.stopPropagation();
                              updateGateStatus(gate._id, gate.gateType, e.target.value, "compliance");
                            }}
                            className={`text-xs font-bold rounded-lg border px-2 py-1 cursor-pointer appearance-none focus:outline-none transition-colors disabled:opacity-60 ${statusSelectCls(gate.status)}`}
                          >
                            {COMPLIANCE_STATUS_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                          {isUpdating
                            ? <RefreshCw size={14} className="animate-spin text-slate-400" />
                            : isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 pt-0 border-t border-slate-100 space-y-2">
                          {gate.applicationDetails?.applicationNumber && (
                            <p className="text-xs text-slate-600">
                              <span className="font-bold">App #:</span> {gate.applicationDetails.applicationNumber}
                            </p>
                          )}
                          {gate.applicationDetails?.authority && (
                            <p className="text-xs text-slate-600">
                              <span className="font-bold">Authority:</span> {gate.applicationDetails.authority}
                            </p>
                          )}
                          {gate.applicationDetails?.submittedDate && (
                            <p className="text-xs text-slate-600">
                              <span className="font-bold">Submitted:</span>{" "}
                              {new Date(gate.applicationDetails.submittedDate).toLocaleDateString("en-IN")}
                            </p>
                          )}
                          {gate.blockingReason && (
                            <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-2 py-1.5 border border-rose-100">
                              {gate.blockingReason}
                            </p>
                          )}
                          {gate.documents && gate.documents.length > 0 && (
                            <p className="text-xs text-slate-500">{gate.documents.length} document(s) attached</p>
                          )}
                          {gate.lastUpdated && (
                            <p className="text-[10px] text-slate-400">
                              Updated: {new Date(gate.lastUpdated).toLocaleDateString("en-IN")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* BMW Authorization — same width as Regulatory Gates */}
          <Card title="BMW Authorization" icon={Leaf}>
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${derivedBmwStatus?.canProceed ? "bg-emerald-100" : "bg-rose-50"}`}>
                    <Leaf size={20} className={derivedBmwStatus?.canProceed ? "text-emerald-600" : "text-rose-500"} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Biomedical Waste Management Authorization</p>
                    <p className="text-xs text-slate-500">
                      Required from State Pollution Control Board —{" "}
                      <span className="font-bold text-rose-600">Hard Gate</span>
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={complianceStatusVariant(derivedBmwStatus?.status ?? "not_started")}>
                    {derivedBmwStatus?.status?.replace(/_/g, " ") ?? "Not Started"}
                  </Badge>
                  {derivedBmwStatus?.isRenewalDue && <Badge variant="warning">Renewal Due</Badge>}
                  {derivedBmwStatus?.isExpired    && <Badge variant="danger">Expired</Badge>}
                </div>
              </div>

              {derivedBmwStatus?.expiryDate && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock size={12} />
                  Expires: {new Date(derivedBmwStatus.expiryDate).toLocaleDateString("en-IN")}
                </p>
              )}

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => { setShowBMWForm(true); setBmwTab("submit"); }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 flex items-center gap-2"
                >
                  Submit Application
                </button>
                {derivedBmwStatus?.exists && (
                  <button
                    onClick={() => { setShowBMWForm(true); setBmwTab("update"); }}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    Update Status
                  </button>
                )}
              </div>
            </div>
          </Card>

          </div>{/* end left column */}

          {/* Go-Live Readiness Gates */}
          <Card title="Go-Live Readiness Gates" icon={CheckCircle2}>
            <div className="space-y-2">
              {filteredGoLiveGates.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  {activeFilter === "all" ? "No go-live gates initialized yet." : `No ${activeFilter} go-live gates.`}
                </p>
              ) : (
                filteredGoLiveGates.map(gate => {
                  const GIcon    = gateIcon(gate.gateType);
                  const isExpanded = expandedGate === `g-${gate._id}`;
                  const isUpdating = updatingGate === gate._id;
                  return (
                    <div
                      key={gate._id}
                      className={`rounded-xl border transition-all ${
                        isExpanded ? "border-blue-200 bg-blue-50/10" : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div
                        className="p-3 flex items-center justify-between cursor-pointer gap-2"
                        onClick={() => setExpandedGate(isExpanded ? null : `g-${gate._id}`)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {gate.isHardGate && (
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" title="Hard Gate" />
                          )}
                          <GIcon size={16} className={`shrink-0 ${gateColor(gate.gateType)}`} />
                          <span className="text-sm font-bold text-slate-800 truncate">
                            {gateLabel(gate.gateType, gate.name)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Inline status dropdown */}
                          <select
                            value={gate.status}
                            disabled={isUpdating}
                            onClick={e => e.stopPropagation()}
                            onChange={e => {
                              e.stopPropagation();
                              updateGateStatus(gate._id, gate.gateType, e.target.value, "golive");
                            }}
                            className={`text-xs font-bold rounded-lg border px-2 py-1 cursor-pointer appearance-none focus:outline-none transition-colors disabled:opacity-60 ${statusSelectCls(gate.status)}`}
                          >
                            {GOLIVE_STATUS_OPTIONS.map(o => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                          {isUpdating
                            ? <RefreshCw size={14} className="animate-spin text-slate-400" />
                            : isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>

                      {isExpanded && gate.blockingReason && (
                        <div className="px-3 pb-3 pt-0 border-t border-slate-100">
                          <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-2 py-1.5 border border-rose-100">
                            {gate.blockingReason}
                          </p>
                          {gate.actionRequired && (
                            <p className="text-xs text-slate-600 mt-2 flex items-start gap-1.5">
                              <ArrowRight size={12} className="mt-0.5 shrink-0 text-blue-500" />
                              {gate.actionRequired}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column: empty state + BMW */}
          <div className="flex flex-col gap-6">
            <Card title="Compliance Gates">
              <div className="text-center py-10 space-y-3">
                <div className="inline-flex p-4 bg-slate-50 rounded-full">
                  <ShieldCheck size={36} className="text-slate-300" />
                </div>
                <p className="text-slate-600 font-semibold">No compliance gates initialized</p>
                <p className="text-sm text-slate-400">
                  Click <span className="font-bold">Initialize Gates</span> above to set up state-specific compliance gates for your lab.
                </p>
              </div>
            </Card>

            {/* BMW Authorization always visible */}
            <Card title="BMW Authorization" icon={Leaf}>
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${derivedBmwStatus?.canProceed ? "bg-emerald-100" : "bg-rose-50"}`}>
                      <Leaf size={20} className={derivedBmwStatus?.canProceed ? "text-emerald-600" : "text-rose-500"} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">Biomedical Waste Management Authorization</p>
                      <p className="text-xs text-slate-500">
                        Required from State Pollution Control Board —{" "}
                        <span className="font-bold text-rose-600">Hard Gate</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={complianceStatusVariant(derivedBmwStatus?.status ?? "not_started")}>
                      {derivedBmwStatus?.status?.replace(/_/g, " ") ?? "Not Started"}
                    </Badge>
                    {derivedBmwStatus?.isRenewalDue && <Badge variant="warning">Renewal Due</Badge>}
                    {derivedBmwStatus?.isExpired    && <Badge variant="danger">Expired</Badge>}
                  </div>
                </div>
                {derivedBmwStatus?.expiryDate && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock size={12} />
                    Expires: {new Date(derivedBmwStatus.expiryDate).toLocaleDateString("en-IN")}
                  </p>
                )}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => { setShowBMWForm(true); setBmwTab("submit"); }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 flex items-center gap-2"
                  >
                    Submit Application
                  </button>
                  {derivedBmwStatus?.exists && (
                    <button
                      onClick={() => { setShowBMWForm(true); setBmwTab("update"); }}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-50 flex items-center gap-2"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right column: Go-Live empty placeholder */}
          <Card title="Go-Live Readiness Gates" icon={CheckCircle2}>
            <div className="text-center py-10 space-y-3">
              <div className="inline-flex p-4 bg-slate-50 rounded-full">
                <CheckCircle2 size={36} className="text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold">No go-live gates initialized</p>
              <p className="text-sm text-slate-400">Initialize gates to see go-live readiness.</p>
            </div>
          </Card>
        </div>
      )}

      {/* ── Critical Blockers (computed from live gate state) ── */}
      {dynamicBlockers.length > 0 && (
        <Card
          title="Critical Blockers"
          icon={AlertTriangle}
          action={
            <span className="inline-flex items-center gap-1 text-xs font-black text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-0.5">
              {dynamicBlockers.length} blocking
            </span>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {dynamicBlockers.map((blocker, i) => (
              <div
                key={i}
                className="flex items-start gap-3 pl-3 pr-3 py-2.5 bg-rose-50 rounded-xl border border-rose-100 border-l-4 border-l-rose-500"
              >
                <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-slate-800 leading-snug truncate">
                    {blocker.name ?? gateLabel(blocker.type)}
                  </p>
                  {blocker.reason && (
                    <p className="text-[11px] text-rose-600 leading-snug mt-0.5 line-clamp-1">{blocker.reason}</p>
                  )}
                  {blocker.actionRequired && (
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5 flex items-start gap-1 line-clamp-1">
                      <ArrowRight size={10} className="shrink-0 mt-0.5 text-blue-400" />
                      {blocker.actionRequired}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── BMW Form Modal (UNCHANGED) ── */}
      {showBMWForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowBMWForm(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 mb-1">BMW Authorization</h2>
            <p className="text-xs text-slate-500 mb-4">Biomedical Waste Management — State Pollution Control Board</p>

            <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1">
              {(["submit", "update"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setBmwTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                    bmwTab === tab ? "bg-white shadow text-slate-800" : "text-slate-500"
                  }`}
                >
                  {tab === "submit" ? "Submit Application" : "Update Status"}
                </button>
              ))}
            </div>

            {bmwTab === "submit" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Application Number</label>
                  <input
                    value={bmwForm.applicationNumber}
                    onChange={e => setBmwForm(f => ({ ...f, applicationNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="e.g. BMW/2024/MH/001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Authority Name</label>
                  <input
                    value={bmwForm.authority}
                    onChange={e => setBmwForm(f => ({ ...f, authority: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="e.g. Maharashtra Pollution Control Board"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Submitted Date</label>
                    <input
                      type="date"
                      value={bmwForm.submittedDate}
                      onChange={e => setBmwForm(f => ({ ...f, submittedDate: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fees Paid (₹)</label>
                    <input
                      type="number"
                      value={bmwForm.fees}
                      onChange={e => setBmwForm(f => ({ ...f, fees: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CBWTF Vendor</label>
                    <input
                      value={bmwForm.cbwtfVendor}
                      onChange={e => setBmwForm(f => ({ ...f, cbwtfVendor: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Vendor name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CBWTF Contact</label>
                    <input
                      value={bmwForm.cbwtfContact}
                      onChange={e => setBmwForm(f => ({ ...f, cbwtfContact: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      placeholder="Phone / Email"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={submitBMW}
                    disabled={bmwLoading}
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {bmwLoading ? "Submitting…" : "Submit Application"}
                  </button>
                  <button
                    onClick={() => setShowBMWForm(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Status</label>
                  <select
                    value={bmwUpdateForm.status}
                    onChange={e => setBmwUpdateForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="in_progress">In Progress</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Authorization Number</label>
                  <input
                    value={bmwUpdateForm.authorizationNumber}
                    onChange={e => setBmwUpdateForm(f => ({ ...f, authorizationNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Official authorization number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Approval Date</label>
                    <input
                      type="date"
                      value={bmwUpdateForm.approvalDate}
                      onChange={e => setBmwUpdateForm(f => ({ ...f, approvalDate: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={bmwUpdateForm.expiryDate}
                      onChange={e => setBmwUpdateForm(f => ({ ...f, expiryDate: e.target.value }))}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={updateBMWStatus}
                    disabled={bmwLoading}
                    className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    {bmwLoading ? "Updating…" : "Update Status"}
                  </button>
                  <button
                    onClick={() => setShowBMWForm(false)}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Initialize Gates Modal (UNCHANGED) ── */}
      {showInitForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowInitForm(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Initialize Compliance Gates</h2>
            <p className="text-xs text-slate-500 mb-4">
              Seeds all state-specific compliance and go-live gates for your lab profile.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <select
                  value={initState}
                  onChange={e => setInitState(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lab Type</label>
                <select
                  value={initLabType}
                  onChange={e => setInitLabType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  {LAB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">District (optional)</label>
                <input
                  value={initDistrict}
                  onChange={e => setInitDistrict(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="e.g. Pune"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={initializeGates}
                  disabled={initializingGates}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {initializingGates ? "Initializing…" : "Initialize Gates"}
                </button>
                <button
                  onClick={() => setShowInitForm(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
