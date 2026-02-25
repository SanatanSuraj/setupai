"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const STATIC_PHASES = [
  {
    title: "Phase 1: Planning & Legal",
    status: "completed",
    tasks: [
      { name: "Business Incorporation (Pvt Ltd/LLP)", done: true, priority: "High" },
      { name: "PAN & TAN Allocation", done: true, priority: "High" },
      { name: "GST Registration", done: true, priority: "Medium" },
      { name: "Clinical Establishment Act (CEA) Preliminary App", done: true, priority: "Critical" },
    ],
  },
  {
    title: "Phase 2: Infrastructure & Licensing",
    status: "active",
    tasks: [
      { name: "Layout Design (Phleb, Processing, BMW zones)", done: true, priority: "High" },
      { name: "BMW Contract with authorized CBWTF", done: false, priority: "Critical" },
      { name: "Fire Safety NOC (Nivesh Mitra/State Portal)", done: false, priority: "High" },
      { name: "Electrical Load Sanction (10-15 KW)", done: true, priority: "Medium" },
    ],
  },
  {
    title: "Phase 3: Procurement & IT",
    status: "active",
    tasks: [
      { name: "Analyzer Selection (Hemat/Biochem)", done: false, priority: "High" },
      { name: "LIMS Selection & Machine Interfacing", done: false, priority: "Medium" },
      { name: "Cold Chain setup (2-8°C monitoring)", done: false, priority: "High" },
    ],
  },
  {
    title: "Phase 4: Staffing & Quality",
    status: "active",
    tasks: [
      { name: "MD Pathologist Onboarding", done: false, priority: "Critical" },
      { name: "Staff Hepatitis-B Vaccination Drive", done: false, priority: "High" },
      { name: "SOP Documentation (ISO 15189 standards)", done: false, priority: "High" },
    ],
  },
];

export function SetupProgress() {
  const [phases, setPhases] = useState(STATIC_PHASES);

  useEffect(() => {
    const saved = localStorage.getItem("roadmap_phases");
    if (saved) {
      try {
        setPhases(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse phases", e);
      }
    }
  }, []);

  const taskCount = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedCount = phases.reduce((acc, p) => acc + p.tasks.filter((t) => t.done).length, 0);
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  // Find next pending task
  let nextTask = "All tasks completed";
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
        <span className="text-xs text-slate-500 font-bold">Week 5 of 12</span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-1000 shadow-sm shadow-blue-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-[10px] md:text-xs text-slate-500 flex items-center gap-1 font-semibold">
        <Clock size={12} className="text-blue-500" /> Next: {nextTask}
      </p>
    </div>
  );
}