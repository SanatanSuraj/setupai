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

type GateStyle = {
  dot: string;
  text: string;
  label: string;
  icon: typeof CheckCircle2;
};

function gateStyle(status: string): GateStyle {
  if (status === "approved")
    return { dot: "bg-emerald-500", text: "text-emerald-700", label: "Approved", icon: CheckCircle2 };
  if (status === "in_progress" || status === "submitted")
    return { dot: "bg-blue-500",    text: "text-blue-700",    label: "In Progress", icon: AlertTriangle };
  if (status === "rejected" || status === "expired")
    return { dot: "bg-red-500",     text: "text-red-600",     label: status.charAt(0).toUpperCase() + status.slice(1), icon: XCircle };
  return   { dot: "bg-gray-300",    text: "text-gray-400",    label: "Not Started", icon: FileCheck };
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
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 skeleton rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || !data.gates?.compliance?.length) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-gray-50 p-3">
          <ShieldCheck size={15} className="text-gray-300 shrink-0" />
          <p className="text-xs text-gray-500">
            No compliance gates initialized.
          </p>
        </div>
        <Link
          href="/dashboard/compliance"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Initialize gates <ArrowRight size={11} />
        </Link>
      </div>
    );
  }

  const gates = data.gates.compliance;
  const pct   = Math.round(data.overallCompletion);

  return (
    <div className="space-y-3">
      {/* Overall status pill */}
      <div className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold ${
        data.canGoLive
          ? "bg-emerald-50 text-emerald-700"
          : data.criticalBlockers > 0
          ? "bg-red-50 text-red-700"
          : "bg-amber-50 text-amber-700"
      }`}>
        <span className="flex items-center gap-1.5">
          {data.canGoLive
            ? <><CheckCircle2 size={12} /> Ready to Go Live</>
            : <><AlertTriangle size={12} /> {data.criticalBlockers} blocker{data.criticalBlockers !== 1 ? "s" : ""}</>
          }
        </span>
        <span className="font-bold">{pct}%</span>
      </div>

      {/* Gate list */}
      <div className="space-y-1.5">
        {GATE_DISPLAY.map(({ type, label }) => {
          const gate = gates.find((g) => g.gateType === type);
          const s = gateStyle(gate?.status ?? "not_started");
          const Icon = s.icon;
          return (
            <div key={type} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2.5">
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.dot}`} />
                <span className="text-sm text-gray-700 font-medium">{label}</span>
              </div>
              <div className="flex items-center gap-1">
                <Icon size={12} className={s.text} />
                <span className={`text-xs font-semibold ${s.text}`}>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href="/dashboard/compliance"
        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
      >
        Manage compliance <ArrowRight size={11} />
      </Link>
    </div>
  );
}
