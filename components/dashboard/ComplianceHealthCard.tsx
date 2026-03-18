"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

interface BMWStatus {
  exists: boolean;
  status: string;
  canProceed: boolean;
}

interface Blocker {
  name: string;
  type: string;
}

interface ReadinessData {
  canGoLive: boolean;
  overallCompletion: number;
  criticalBlockers: number;
  bmwStatus: BMWStatus;
  blockers: Blocker[];
  gates: {
    compliance: Array<{ gateType: string; status: string }>;
  };
}

const GATE_DISPLAY = [
  { type: "cea_approval",      label: "CEA Registration" },
  { type: "fire_noc",          label: "Fire Safety NOC" },
  { type: "bmw_authorization", label: "BMW Authorization" },
];

function gateStatusStyle(status: string) {
  if (status === "approved") return { bg: "bg-emerald-50", border: "border-emerald-100", icon: CheckCircle2, iconColor: "text-emerald-500", label: "text-emerald-600", text: "Approved" };
  if (status === "in_progress" || status === "submitted") return { bg: "bg-blue-50", border: "border-blue-100", icon: AlertTriangle, iconColor: "text-blue-500", label: "text-blue-600", text: "In Progress" };
  if (status === "rejected" || status === "expired") return { bg: "bg-rose-50", border: "border-rose-100", icon: XCircle, iconColor: "text-rose-500", label: "text-rose-600", text: status };
  return { bg: "bg-slate-50", border: "border-slate-100", icon: FileCheck, iconColor: "text-slate-400", label: "text-slate-400", text: "Not Started" };
}

export function ComplianceHealthCard() {
  const [data, setData] = useState<ReadinessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/compliance/readiness")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3 py-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  // No gates initialized yet — show static fallback with link
  if (!data || !data.gates?.compliance?.length) {
    return (
      <div className="space-y-3 py-1">
        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <Loader2 size={14} className="text-slate-400" />
          <p className="text-xs text-slate-500 font-medium">No compliance gates found. Initialize gates to see live status.</p>
        </div>
        <Link
          href="/dashboard/compliance"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors mt-1"
        >
          Open Compliance Center <ArrowRight size={12} />
        </Link>
      </div>
    );
  }

  const gates = data.gates.compliance;

  return (
    <div className="space-y-3 py-1">
      {/* Go-live badge */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${
        data.canGoLive
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : data.criticalBlockers > 0
            ? "bg-rose-50 border-rose-200 text-rose-700"
            : "bg-amber-50 border-amber-200 text-amber-700"
      }`}>
        {data.canGoLive
          ? <><CheckCircle2 size={13} /> Ready to Go Live — {Math.round(data.overallCompletion)}% complete</>
          : <><AlertTriangle size={13} /> {data.criticalBlockers} blocker{data.criticalBlockers !== 1 ? "s" : ""} — {Math.round(data.overallCompletion)}% complete</>
        }
      </div>

      {/* Top 3 gate statuses */}
      {GATE_DISPLAY.map(({ type, label }) => {
        const gate = gates.find((g) => g.gateType === type);
        const s = gateStatusStyle(gate?.status ?? "not_started");
        const Icon = s.icon;
        return (
          <div
            key={type}
            className={`flex items-center justify-between p-3 ${s.bg} rounded-xl border ${s.border}`}
          >
            <div className="flex items-center gap-2">
              <Icon size={16} className={s.iconColor} />
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </div>
            <span className={`text-xs font-black uppercase tracking-wider ${s.label}`}>{s.text}</span>
          </div>
        );
      })}

      <Link
        href="/dashboard/compliance"
        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors mt-1"
      >
        Manage Compliance <ArrowRight size={12} />
      </Link>
    </div>
  );
}
