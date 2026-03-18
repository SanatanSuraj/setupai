"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { Card } from "@/components/dashboard/Card";

export function NablStatCard() {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    fetch("/api/nabl/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.checklist) {
          const completed = Object.values(data.checklist).filter(Boolean).length;
          setPercentage(Math.round((completed / 180) * 100));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500">NABL Readiness</p>
          <p className="text-2xl font-bold mt-1 tracking-tight text-amber-700">{percentage}%</p>
          <p className="text-xs text-gray-400 mt-0.5">ISO 15189:2022</p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Award size={16} />
        </div>
      </div>
    </div>
  );
}

export function NablSnapshotCard() {
  const [completed, setCompleted] = useState(0);
  const total = 180;

  useEffect(() => {
    fetch("/api/nabl/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.checklist) {
          const count = Object.values(data.checklist).filter(Boolean).length;
          setCompleted(count);
        }
      })
      .catch(() => {});
  }, []);

  const percentage = Math.round((completed / total) * 100);

  return (
    <Card title="NABL Accreditation" subtitle="ISO 15189:2022" icon={Award}>
      <div className="space-y-3">
        {/* Score bar */}
        <div>
          <div className="flex items-end justify-between mb-1.5">
            <span className="text-2xl font-bold text-gray-900">{percentage}<span className="text-sm font-medium text-gray-400 ml-0.5">%</span></span>
            <span className="text-xs text-gray-400">{completed} / {total} docs</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${percentage}%` }} />
          </div>
        </div>
        {/* Pillars */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Docs",   sub: "Checklist" },
            { label: "Tests",  sub: "PT / IQC" },
            { label: "Audits", sub: "Schedule" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-gray-50 border border-gray-100 p-2.5 text-center">
              <p className="text-xs font-semibold text-gray-800">{item.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 font-medium">
          Preparation Phase · Start with Quality Manual &amp; SOPs
        </div>
        <Link href="/dashboard/nabl" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors">
          Open NABL module <ArrowRight size={11} />
        </Link>
      </div>
    </Card>
  );
}