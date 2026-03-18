"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/dashboard/Badge";
import { StatCard } from "@/components/dashboard/Card";
import {
  CheckCircle2,
  Map,
  Target,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Sparkles,
  Building2,
  MapPin,
  Wallet,
  FlaskConical,
} from "lucide-react";

interface Task {
  title: string;
  status: string;
  module?: string;
  dueDate?: string;
}

interface RoadmapData {
  _id: string;
  tasks: Task[];
  progress: number;
  estimatedCost: number;
  timeline: { start: string; end: string };
}

const STATIC_PHASES = [
  {
    title: "Phase 1: Location Finalization",
    duration: "Week 1–2",
    status: "pending",
    color: "blue",
    tasks: [
      { name: "Rent agreement validation", done: false, priority: "High" },
      { name: "Building architecture review", done: false, priority: "High" },
      { name: "Floor plan approval", done: false, priority: "High" },
      { name: "Business Incorporation (Pvt Ltd/LLP)", done: false, priority: "Critical" },
      { name: "PAN & TAN Allocation", done: false, priority: "High" },
      { name: "GST Registration", done: false, priority: "Medium" },
    ],
  },
  {
    title: "Phase 2: Procurement & IT",
    duration: "Week 3–4",
    status: "pending",
    color: "violet",
    tasks: [
      { name: "Analyzer Selection (Hematology/Biochemistry)", done: false, priority: "High" },
      { name: "LIMS Selection & Machine Interfacing", done: false, priority: "High" },
      { name: "Cold Chain Setup (2–8°C monitoring)", done: false, priority: "High" },
    ],
  },
  {
    title: "Phase 3: Staffing & Quality",
    duration: "Week 4–6",
    status: "pending",
    color: "emerald",
    tasks: [
      { name: "MD Pathologist Onboarding", done: false, priority: "Critical" },
      { name: "Staff Hiring & Training", done: false, priority: "High" },
      { name: "Hepatitis-B Vaccination Drive", done: false, priority: "High" },
      { name: "SOP Documentation (ISO 15189 standards)", done: false, priority: "High" },
      { name: "API Tasks Implementation", done: false, priority: "Medium" },
    ],
  },
  {
    title: "Phase 4: Licensing & Compliance Finalization",
    duration: "Week 6–8",
    status: "pending",
    color: "amber",
    tasks: [
      { name: "CEA/CMO Approval", done: false, priority: "Critical" },
      { name: "Trade License", done: false, priority: "High" },
      { name: "Pollution Control Board Clearance", done: false, priority: "High" },
      { name: "Labour Department Registration", done: false, priority: "Medium" },
      { name: "Final Compliance Checks", done: false, priority: "High" },
      { name: "Layout Design (Phlebotomy, Processing, BMW zones)", done: false, priority: "High" },
      { name: "BMW Contract with authorized CBWTF", done: false, priority: "Critical" },
      { name: "Fire Safety NOC (State Portal/Nivesh Mitra)", done: false, priority: "High" },
      { name: "Electrical Load Sanction (10–15 KW)", done: false, priority: "Medium" },
      { name: "Clinical Establishment Act (CEA) Preliminary Application", done: false, priority: "Critical" },
    ],
  },
  {
    title: "Phase 5: Launch",
    duration: "Week 7–8",
    status: "pending",
    color: "rose",
    tasks: [
      { name: "LIMS Activation", done: false, priority: "High" },
      { name: "Staff Certification", done: false, priority: "High" },
      { name: "Go-Live Checklist Clearance", done: false, priority: "Critical" },
      { name: "First Patient Day Operations", done: false, priority: "Critical" },
    ],
  },
];

const PHASE_COLORS: Record<string, { dot: string; ring: string; header: string }> = {
  blue:    { dot: "bg-blue-500",    ring: "ring-blue-100 border-blue-200",    header: "bg-blue-50/60" },
  violet:  { dot: "bg-violet-500",  ring: "ring-violet-100 border-violet-200", header: "bg-violet-50/60" },
  emerald: { dot: "bg-emerald-500", ring: "ring-emerald-100 border-emerald-200",header: "bg-emerald-50/60" },
  amber:   { dot: "bg-amber-500",   ring: "ring-amber-100 border-amber-200",   header: "bg-amber-50/60" },
  rose:    { dot: "bg-rose-500",    ring: "ring-rose-100 border-rose-200",     header: "bg-rose-50/60" },
};

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal",
];
const UTS = [
  "Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi (NCT)",
  "Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const LAB_TYPES = [
  { value: "basic",      label: "Basic Diagnostic Lab",    desc: "Haematology, biochemistry, urine" },
  { value: "medium",     label: "Medium Lab",              desc: "+ microbiology, serology" },
  { value: "advanced",   label: "Advanced / NABL Lab",     desc: "+ molecular, cytology, histopathology" },
  { value: "clinic_lab", label: "Clinic + Lab",            desc: "Attached to an OPD / clinic" },
];

export default function RoadmapPage() {
  const [phases, setPhases]               = useState(STATIC_PHASES);
  const [isLoaded, setIsLoaded]           = useState(false);
  const [, setRoadmap]                    = useState<RoadmapData | null>(null);
  const [apiLoading, setApiLoading]       = useState(true);
  const [generating, setGenerating]       = useState(false);
  const [roadmapReady, setRoadmapReady]   = useState(false); // true only after generate

  // form fields
  const [labType,   setLabType]   = useState("basic");
  const [state,     setState]     = useState("");
  const [district,  setDistrict]  = useState("");
  const [city,      setCity]      = useState("");
  const [budget,    setBudget]    = useState("1000000");

  // ── Load saved phase progress from MongoDB API ──
  useEffect(() => {
    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((data) => {
        if (data && data._id) {
          setRoadmap(data);
          setRoadmapReady(true);
          if (Array.isArray(data.phases) && data.phases.length > 0) {
            setPhases(data.phases);
          }
          // Restore form metadata from roadmap (stored at top level)
          if (data.labType) setLabType(data.labType);
          if (data.state) setState(data.state);
          if (data.district) setDistrict(data.district);
          if (data.city) setCity(data.city);
          if (data.estimatedCost) setBudget(String(data.estimatedCost));
        }
      })
      .catch(() => {})
      .finally(() => {
        setApiLoading(false);
        setIsLoaded(true);
      });
  }, []);

  // ── Persist phase progress to MongoDB API ──
  useEffect(() => {
    if (isLoaded && roadmapReady) {
      fetch("/api/roadmap/sync", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phases }),
      })
        .then((r) => { if (!r.ok) throw new Error("Sync failed"); })
        .catch((err) => console.error("[Roadmap] Sync error:", err));
    }
  }, [phases, isLoaded, roadmapReady]);

  // ── Generate roadmap ──
  const generateRoadmap = async () => {
    if (!state) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labType,
          state,
          district: district || undefined,
          city: city || undefined,
          budget: parseInt(budget, 10) || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) setRoadmap(data);

      // Fire-and-forget background tasks
      fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labType, state, district, city, budget: parseInt(budget, 10) || 1000000 }),
      }).catch(() => {});
      fetch("/api/compliance/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, labType, district: district || undefined }),
      }).catch(() => {});

      setRoadmapReady(true);
    } catch {
      // Still proceed to roadmap view on network error
      setRoadmapReady(true);
    } finally {
      setGenerating(false);
    }
  };

  const togglePhaseTask = (phaseIdx: number, taskIdx: number) => {
    setPhases((prev) => {
      const next = [...prev];
      const phase = { ...next[phaseIdx] };
      const tasks = [...phase.tasks];
      tasks[taskIdx] = { ...tasks[taskIdx], done: !tasks[taskIdx].done };
      phase.tasks = tasks;
      const anyDone = tasks.some((t) => t.done);
      const allDone = tasks.every((t) => t.done);
      phase.status = allDone ? "completed" : anyDone ? "active" : "pending";
      next[phaseIdx] = phase;
      return next;
    });
  };

  // ── Loading skeleton ──
  if (apiLoading) {
    return (
      <div className="p-6 md:p-8 space-y-4 animate-fade-in-up">
        <div className="h-10 w-64 rounded-lg skeleton" />
        <div className="h-72 rounded-2xl skeleton" />
      </div>
    );
  }

  // ── Onboarding form (no roadmap yet) ──
  if (!roadmapReady) {
    const selected = LAB_TYPES.find((l) => l.value === labType);
    return (
      <div className="min-h-screen p-6 md:p-8 animate-fade-in-up">

        {/* Page header */}
        <div className="flex items-start gap-3 pb-6 border-b border-gray-100 mb-8">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <Map size={17} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Setup Roadmap</h1>
            <p className="text-sm text-gray-500 mt-0.5">Generate your personalized lab setup plan</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 ring-1 ring-blue-100 mb-4">
              <Sparkles size={12} />
              AI-Powered · Takes 30 seconds
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Build your personalized roadmap
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Tell us about your lab and we&apos;ll generate a step-by-step compliance and setup plan tailored to your state&apos;s regulations.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">

            {/* Section: Lab Type */}
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">1</div>
                <p className="text-sm font-semibold text-gray-800">What type of lab are you setting up?</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {LAB_TYPES.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => setLabType(l.value)}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-150 ${
                      labType === l.value
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white"
                    }`}
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      labType === l.value ? "bg-blue-600" : "bg-white border border-gray-200"
                    }`}>
                      <FlaskConical size={15} className={labType === l.value ? "text-white" : "text-gray-400"} />
                    </div>
                    <div>
                      <p className={`text-sm font-semibold leading-tight ${labType === l.value ? "text-blue-700" : "text-gray-800"}`}>
                        {l.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{l.desc}</p>
                    </div>
                    {labType === l.value && (
                      <CheckCircle2 size={15} className="text-blue-500 shrink-0 ml-auto mt-0.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Section: Location */}
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">2</div>
                <p className="text-sm font-semibold text-gray-800">Where is your lab located?</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={11} className="text-gray-400" />
                    State / Union Territory <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="input-base"
                    required
                  >
                    <option value="">— Select State / UT —</option>
                    <optgroup label="States">
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </optgroup>
                    <optgroup label="Union Territories">
                      {UTS.map((u) => <option key={u}>{u}</option>)}
                    </optgroup>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">District</label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="input-base"
                      placeholder="e.g. Mumbai Suburban"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">City / Town</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-base"
                      placeholder="e.g. Mumbai"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Budget */}
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">3</div>
                <p className="text-sm font-semibold text-gray-800">What is your estimated budget?</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { label: "₹5–10L",  value: "750000" },
                  { label: "₹10–25L", value: "1750000" },
                  { label: "₹25–50L", value: "3750000" },
                  { label: "₹50L+",   value: "6000000" },
                ].map((b) => (
                  <button
                    key={b.value}
                    onClick={() => setBudget(b.value)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      budget === b.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Wallet size={13} className="text-gray-400 shrink-0" />
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="input-base"
                  placeholder="Custom amount in ₹"
                />
              </div>
            </div>

            {/* Summary + CTA */}
            <div className="p-6 bg-gray-50">
              {/* Mini summary */}
              {(labType || state) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selected && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
                      <Building2 size={11} className="text-gray-400" />
                      {selected.label}
                    </span>
                  )}
                  {state && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
                      <MapPin size={11} className="text-gray-400" />
                      {city || district || state}
                    </span>
                  )}
                  {budget && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700">
                      <Wallet size={11} className="text-gray-400" />
                      ₹{(parseInt(budget) / 100000).toFixed(1)}L budget
                    </span>
                  )}
                </div>
              )}

              <button
                onClick={generateRoadmap}
                disabled={generating || !state}
                className="w-full btn-primary justify-center py-3 text-sm disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Generating your roadmap…
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Generate Personalized Roadmap
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
              {!state && (
                <p className="text-center text-xs text-gray-400 mt-2">Select a state to continue</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Roadmap phases view ──
  const taskCount      = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedCount = phases.reduce((acc, p) => acc + p.tasks.filter((t) => t.done).length, 0);
  const progress       = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  const criticalCount  = phases.reduce(
    (acc, p) =>
      p.status !== "pending"
        ? acc + p.tasks.filter((t) => t.priority === "Critical" && !t.done).length
        : acc,
    0
  );

  return (
    <div className="space-y-6 p-6 md:p-8 animate-fade-in-up">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 mt-0.5">
            <Map size={17} className="text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Setup Roadmap</h1>
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                progress === 0
                  ? "bg-gray-50 text-gray-500 ring-gray-200/80"
                  : progress === 100
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80"
                  : "bg-blue-50 text-blue-700 ring-blue-200/80"
              }`}>
                {progress === 0 ? "Not Started" : progress === 100 ? "Complete" : "In Progress"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {[city, district, state].filter(Boolean).join(", ")}
              {labType ? ` · ${LAB_TYPES.find((l) => l.value === labType)?.label ?? labType}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Overall Progress"  value={`${progress}%`}              accent="blue"  icon={Target} />
        <StatCard label="Tasks Done"         value={`${completedCount}/${taskCount}`} accent="slate" icon={CheckCircle2} />
        <StatCard label="Critical Blockers"  value={criticalCount}               accent={criticalCount > 0 ? "red" : "green"} icon={AlertTriangle} />
        <StatCard label="Est. Timeline"      value="60 days"                     accent="slate" icon={Calendar} />
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-xs p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-800">Overall Completion</p>
          <span className="text-sm font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">Estimated launch · 60 days from start</p>
      </div>

      {/* Phase cards */}
      <div className="space-y-3">
        {phases.map((phase, idx) => {
          const c         = PHASE_COLORS[phase.color as string] ?? PHASE_COLORS.blue;
          const phaseDone = phase.tasks.filter((t) => t.done).length;
          const phaseTotal= phase.tasks.length;
          const phasePct  = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;

          return (
            <div
              key={idx}
              className={`bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-sm transition-shadow ${
                phase.status === "active"
                  ? `${c.ring} ring-2`
                  : "border-gray-100"
              }`}
            >
              {/* Phase header */}
              <div className={`px-5 py-3.5 flex items-center justify-between ${
                phase.status === "completed" ? "bg-gray-50"
                : phase.status === "active"  ? c.header
                : "bg-white"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 border-2 ${
                    phase.status === "completed"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                      : phase.status === "active"
                      ? "border-blue-400 bg-blue-50 text-blue-600"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}>
                    {phase.status === "completed"
                      ? <CheckCircle2 size={13} />
                      : idx + 1
                    }
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${phase.status === "pending" ? "text-gray-400" : "text-gray-800"}`}>
                      {phase.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={10} />
                      {(phase as { duration?: string }).duration ?? ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-medium text-gray-400">{phaseDone}/{phaseTotal}</span>
                  <Badge
                    variant={
                      phase.status === "completed" ? "success"
                      : phase.status === "active"  ? "info"
                      : "slate"
                    }
                    dot
                  >
                    {phase.status === "completed" ? "Done"
                      : phase.status === "active"  ? "Active"
                      : "Pending"}
                  </Badge>
                </div>
              </div>

              {/* Phase progress bar (only show if started) */}
              {phasePct > 0 && (
                <div className="px-5 py-1.5 border-b border-gray-50">
                  <div className="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${phasePct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tasks */}
              <div className="p-2 space-y-0.5">
                {phase.tasks.map((task, tIdx) => (
                  <div
                    key={tIdx}
                    onClick={() => togglePhaseTask(idx, tIdx)}
                    className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-4 w-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                        task.done
                          ? "bg-emerald-500"
                          : "border-2 border-gray-200 group-hover:border-blue-400"
                      }`}>
                        {task.done && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <span className={`text-sm truncate ${
                        task.done ? "text-gray-400 line-through" : "text-gray-700"
                      }`}>
                        {task.name}
                      </span>
                    </div>
                    <Badge
                      variant={
                        task.priority === "Critical" ? "danger"
                        : task.priority === "High"    ? "warning"
                        : "slate"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
