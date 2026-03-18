"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const STATIC_PHASES = [
  {
    title: "Phase 1: Location Finalization",
    tasks: [
      { name: "Rent agreement validation", done: false },
      { name: "Building architecture review", done: false },
      { name: "Floor plan approval", done: false },
      { name: "Business Incorporation (Pvt Ltd/LLP)", done: false },
      { name: "PAN & TAN Allocation", done: false },
      { name: "GST Registration", done: false },
    ],
  },
  {
    title: "Phase 2: Procurement & IT",
    tasks: [
      { name: "Analyzer Selection (Hematology/Biochemistry)", done: false },
      { name: "LIMS Selection & Machine Interfacing", done: false },
      { name: "Cold Chain Setup (2–8°C monitoring)", done: false },
    ],
  },
  {
    title: "Phase 3: Staffing & Quality",
    tasks: [
      { name: "MD Pathologist Onboarding", done: false },
      { name: "Staff Hiring & Training", done: false },
      { name: "Hepatitis-B Vaccination Drive", done: false },
      { name: "SOP Documentation (ISO 15189 standards)", done: false },
      { name: "API Tasks Implementation", done: false },
    ],
  },
  {
    title: "Phase 4: Licensing & Compliance Finalization",
    tasks: [
      { name: "CEA/CMO Approval", done: false },
      { name: "Trade License", done: false },
      { name: "Pollution Control Board Clearance", done: false },
      { name: "Labour Department Registration", done: false },
      { name: "Final Compliance Checks", done: false },
      { name: "Layout Design (Phlebotomy, Processing, BMW zones)", done: false },
      { name: "BMW Contract with authorized CBWTF", done: false },
      { name: "Fire Safety NOC (State Portal/Nivesh Mitra)", done: false },
      { name: "Electrical Load Sanction (10–15 KW)", done: false },
      { name: "Clinical Establishment Act (CEA) Preliminary Application", done: false },
    ],
  },
  {
    title: "Phase 5: Launch",
    tasks: [
      { name: "LIMS Activation", done: false },
      { name: "Staff Certification", done: false },
      { name: "Go-Live Checklist Clearance", done: false },
      { name: "First Patient Day Operations", done: false },
    ],
  },
];

export function SetupProgress() {
  const [phases, setPhases] = useState(STATIC_PHASES);

  useEffect(() => {
    fetch("/api/roadmap")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && data.phases && Array.isArray(data.phases) && data.phases.length > 0) {
          setPhases(data.phases);
        }
      })
      .catch(() => {});
  }, []);

  const taskCount = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedCount = phases.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.done).length,
    0
  );
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  let nextTask = "All tasks completed!";
  let nextPhaseTitle = "";
  for (const phase of phases) {
    const pending = phase.tasks.find((t) => !t.done);
    if (pending) {
      nextTask = pending.name;
      nextPhaseTitle = phase.title.split(":")[0];
      break;
    }
  }

  // Active phase index
  const activePhaseIdx = phases.findIndex((p) => p.tasks.some((t) => !t.done));

  return (
    <div className="space-y-4">
      {/* Progress number + bar */}
      <div>
        <div className="flex items-end justify-between mb-2">
          <div>
            <span className="text-3xl font-bold text-gray-900 tracking-tight">{progress}</span>
            <span className="text-lg font-semibold text-gray-400 ml-0.5">%</span>
          </div>
          <span className="text-xs text-gray-400 font-medium mb-1">
            {completedCount} / {taskCount}
          </span>
        </div>
        <div className="relative h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-blue-600 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Phase dots */}
      <div className="flex items-center gap-1">
        {phases.map((phase, i) => {
          const phaseDone = phase.tasks.every((t) => t.done);
          const isActive = i === activePhaseIdx;
          return (
            <div
              key={i}
              title={phase.title}
              className={`flex-1 h-1 rounded-full transition-colors ${
                phaseDone
                  ? "bg-blue-600"
                  : isActive
                  ? "bg-blue-300"
                  : "bg-gray-100"
              }`}
            />
          );
        })}
      </div>

      {/* Next task */}
      {nextTask !== "All tasks completed!" && (
        <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Next up · {nextPhaseTitle}
          </p>
          <p className="text-xs text-gray-700 font-medium line-clamp-2">{nextTask}</p>
        </div>
      )}

      <Link
        href="/dashboard/roadmap"
        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
      >
        View roadmap <ArrowRight size={12} />
      </Link>
    </div>
  );
}
