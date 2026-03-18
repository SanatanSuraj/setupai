"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";

interface NablData {
  nablStatus: {
    readinessScore: number;
    phase: "preparation" | "application" | "assessment" | "accredited";
    nextMilestone: string;
  };
  qualityManual: {
    sections: { name: string; status: string }[];
    overallCompletion: number;
  };
  documentControl: {
    totalDocuments: number;
    controlledDocuments: number;
  };
  nablRequirements: { category: string; completed: number; total: number }[];
}

const PHASE_LABEL: Record<string, string> = {
  preparation: "Preparation Phase",
  application:  "Application Phase",
  assessment:   "Assessment Phase",
  accredited:   "Accredited",
};

export function NablStatusCard() {
  const [data, setData]       = useState<NablData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/nabl/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d?.success ? d : null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-8 w-24 skeleton rounded" />
        <div className="h-1.5 w-full skeleton rounded-full" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 skeleton rounded-lg" />)}
        </div>
      </div>
    );
  }

  const score   = data?.nablStatus.readinessScore ?? 0;
  const phase   = data?.nablStatus.phase ?? "preparation";
  const milestone = data?.nablStatus.nextMilestone ?? "Complete Quality Manual";

  // Total requirements across all categories
  const totalReqs     = data?.nablRequirements.reduce((a, r) => a + r.total, 0)       ?? 76;
  const completedReqs = data?.nablRequirements.reduce((a, r) => a + r.completed, 0)   ?? 0;

  // Quality manual: how many sections are completed
  const qmSections   = data?.qualityManual.sections ?? [];
  const qmDone       = qmSections.filter((s) => s.status === "completed").length;
  const qmTotal      = qmSections.length || 8;

  // Document control
  const docsControlled = data?.documentControl.controlledDocuments ?? 0;
  const docsTotal      = data?.documentControl.totalDocuments ?? 0;

  const isNotStarted = score === 0 && completedReqs === 0;

  const pillars = [
    { label: "Docs",   value: isNotStarted ? "—" : `${docsControlled}/${docsTotal}`,  sub: docsControlled > 0 ? "Controlled" : "Pending" },
    { label: "QM",     value: isNotStarted ? "—" : `${qmDone}/${qmTotal}`,            sub: qmDone > 0 ? "Sections" : "Pending" },
    { label: "Reqs",   value: isNotStarted ? "—" : `${completedReqs}/${totalReqs}`,   sub: completedReqs > 0 ? "Met" : "Pending" },
  ];

  return (
    <div className="space-y-3">
      {/* Score bar */}
      <div>
        <div className="flex items-end justify-between mb-1.5">
          <span className={`text-2xl font-bold tracking-tight ${isNotStarted ? "text-gray-300" : "text-gray-900"}`}>
            {score}
            <span className={`text-sm font-medium ml-0.5 ${isNotStarted ? "text-gray-300" : "text-gray-400"}`}>%</span>
          </span>
          <span className="text-xs text-gray-400">
            {isNotStarted ? "0 / 76 req." : `${completedReqs} / ${totalReqs} req.`}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          {score > 0 && (
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          )}
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-3 gap-2">
        {pillars.map((p) => (
          <div key={p.label} className="rounded-lg bg-gray-50 border border-gray-100 p-2.5 text-center">
            <p className={`text-xs font-semibold ${isNotStarted ? "text-gray-400" : "text-gray-800"}`}>{p.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{p.value}</p>
            <p className="text-[9px] text-gray-300 mt-0.5">{p.sub}</p>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className={`rounded-lg border p-3 text-xs font-medium flex items-center gap-2 ${
        isNotStarted
          ? "bg-gray-50 border-gray-100 text-gray-500"
          : phase === "accredited"
          ? "bg-emerald-50 border-emerald-100 text-emerald-800"
          : "bg-amber-50 border-amber-100 text-amber-800"
      }`}>
        <Award size={12} className="shrink-0" />
        {isNotStarted ? "Not started · Open NABL module to begin" : `${PHASE_LABEL[phase]} · ${milestone}`}
      </div>

      <Link
        href="/dashboard/nabl"
        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
      >
        Open NABL module <ArrowRight size={11} />
      </Link>
    </div>
  );
}
