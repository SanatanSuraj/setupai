"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import Link from "next/link";

const ROADMAP_STORAGE_KEY = "roadmap_phases_v3";

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
    const saved = localStorage.getItem(ROADMAP_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const valid =
          Array.isArray(parsed) &&
          parsed.length === STATIC_PHASES.length &&
          parsed[0]?.title?.startsWith("Phase 1:");
        if (valid) setPhases(parsed);
      } catch (e) {
        console.error("Failed to parse roadmap phases", e);
      }
    }
  }, []);

  const taskCount = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedCount = phases.reduce(
    (acc, p) => acc + p.tasks.filter((t) => t.done).length,
    0
  );
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  let nextTask = "All tasks completed!";
  for (const phase of phases) {
    const pending = phase.tasks.find((t) => !t.done);
    if (pending) {
      nextTask = pending.name;
      break;
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <span className="text-3xl font-black text-slate-900 tracking-tight">{progress}%</span>
        <span className="text-xs text-slate-500 font-bold">
          {completedCount} / {taskCount} tasks
        </span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-700 shadow-sm shadow-blue-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-semibold">
        <Clock size={12} className="text-blue-500 shrink-0" />
        <span className="truncate">Next: {nextTask}</span>
      </p>
      <Link
        href="/dashboard/roadmap"
        className="inline-block text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
      >
        View full roadmap →
      </Link>
    </div>
  );
}
