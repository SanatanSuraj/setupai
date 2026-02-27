"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { CheckCircle2 } from "lucide-react";

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

export default function RoadmapPage() {
  const [phases, setPhases] = useState(STATIC_PHASES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [labType, setLabType] = useState("basic");
  const [state, setState] = useState("Maharashtra");
  const [district, setDistrict] = useState("Mumbai Suburban");
  const [city, setCity] = useState("Mumbai");
  const [budget, setBudget] = useState("1000000");

  useEffect(() => {
    const saved = localStorage.getItem("roadmap_phases");
    if (saved) {
      try {
        setPhases(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse phases", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("roadmap_phases", JSON.stringify(phases));
    }
  }, [phases, isLoaded]);

  useEffect(() => {
    fetch("/api/roadmap")
      .then((r) => r.json())
      .then((data) => {
        setRoadmap(data && data._id ? data : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const generateRoadmap = async () => {
    setLoading(true);
    const res = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        labType,
        state,
        district,
        city,
        budget: parseInt(budget, 10) || undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) setRoadmap(data);
    setLoading(false);
    setOnboarding(false);
  };

  const updateTaskStatus = async (taskIndex: number, status: string) => {
    const res = await fetch("/api/roadmap/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskIndex, status }),
    });
    if (res.ok) {
      const data = await res.json();
      setRoadmap(data);
    }
  };

  const togglePhaseTask = (phaseIdx: number, taskIdx: number) => {
    setPhases((prev) => {
      const newPhases = [...prev];
      const phase = { ...newPhases[phaseIdx] };
      const tasks = [...phase.tasks];
      tasks[taskIdx] = { ...tasks[taskIdx], done: !tasks[taskIdx].done };
      phase.tasks = tasks;
      const allDone = tasks.every((t) => t.done);
      phase.status = allDone ? "completed" : "active";
      newPhases[phaseIdx] = phase;
      return newPhases;
    });
  };

  if (loading && !roadmap) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-muted-foreground">Loading roadmap…</p>
      </div>
    );
  }

  if (!roadmap && !onboarding) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground">Setup Roadmap</h1>
        <p className="mt-1 text-muted-foreground">Generate your personalized setup roadmap.</p>
        <div className="mt-8 max-w-md rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold text-foreground">Onboarding</h2>
          <p className="mt-1 text-sm text-muted-foreground">Select lab type, location, and budget to generate your roadmap.</p>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Lab type</label>
              <select
                value={labType}
                onChange={(e) => setLabType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                <option value="basic">Basic</option>
                <option value="medium">Medium</option>
                <option value="advanced">Advanced</option>
                <option value="clinic_lab">Clinic + Lab</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder="Maharashtra"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder="Mumbai Suburban"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Budget (₹)</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
                placeholder="1000000"
              />
            </div>
            <button
              onClick={generateRoadmap}
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Generate roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }

  const taskCount = phases.reduce((acc, p) => acc + p.tasks.length, 0);
  const completedCount = phases.reduce((acc, p) => acc + p.tasks.filter((t) => t.done).length, 0);
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Setup Roadmap</h1>
        <p className="mt-1 text-muted-foreground">Track your setup timeline and tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Location</p>
            <p className="text-lg font-bold text-slate-800">{city}, {district}, {state}</p>
          </div>
          <Card title="Timeline Progress">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-3xl font-black text-slate-900">
                  Day {Math.round((progress / 100) * 120)} <span className="text-slate-400 text-sm font-normal">/ 120</span>
                </p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Launch: July 2026</p>
              </div>
              <Badge variant="success">On Track</Badge>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
            </div>
          </Card>
        </div>
        <Card title="Quick Stats">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tasks Completed</span>
              <span className="font-bold text-slate-800">{completedCount} / {taskCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Critical Blockers</span>
              <span className="font-bold text-rose-600">1</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {phases.map((phase, idx) => (
          <div
            key={idx}
            className={`bg-white border rounded-2xl overflow-hidden ${
              phase.status === "active" ? "border-blue-200 ring-2 ring-blue-50" : "border-slate-200"
            }`}
          >
            <div
              className={`px-6 py-4 flex items-center justify-between ${
                phase.status === "completed" ? "bg-slate-50" : phase.status === "active" ? "bg-blue-50/30" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {phase.status === "completed" ? (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                ) : (
                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      phase.status === "active" ? "border-blue-500 animate-pulse" : "border-slate-300"
                    }`}
                  />
                )}
                <h3 className={`font-bold ${phase.status === "pending" ? "text-slate-400" : "text-slate-800"}`}>
                  {phase.title}
                </h3>
              </div>
              <Badge
                variant={phase.status === "completed" ? "success" : phase.status === "active" ? "info" : "slate"}
              >
                {phase.status.toUpperCase()}
              </Badge>
            </div>
            {phase.status !== "pending" && (
              <div className="p-4 space-y-2">
                {phase.tasks.map((task, tIdx) => (
                  <div
                    key={tIdx}
                    onClick={() => togglePhaseTask(idx, tIdx)}
                    className="flex items-center justify-between py-2 px-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          task.done ? "bg-emerald-500 border-emerald-500" : "border-slate-300 group-hover:border-blue-400"
                        }`}
                      >
                        {task.done && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span
                        className={`text-sm ${task.done ? "text-slate-400 line-through" : "text-slate-700 font-medium"}`}
                      >
                        {task.name}
                      </span>
                    </div>
                    <Badge
                      variant={
                        task.priority === "Critical" ? "danger" : task.priority === "High" ? "warning" : "info"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {roadmap && roadmap.tasks.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-foreground mb-4">API Tasks</h2>
          <ul className="space-y-2">
            {roadmap.tasks.map((task, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div>
                  <span className="font-medium text-foreground">{task.title}</span>
                  {task.module && <span className="ml-2 text-sm text-muted-foreground">({task.module})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      task.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : task.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {task.status}
                  </span>
                  {task.status !== "completed" && (
                    <button
                      onClick={() => updateTaskStatus(i, task.status === "in_progress" ? "completed" : "in_progress")}
                      className="rounded bg-primary/10 px-2 py-1 text-sm text-primary hover:bg-primary/20"
                    >
                      {task.status === "in_progress" ? "Mark done" : "Start"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
