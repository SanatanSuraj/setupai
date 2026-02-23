"use client";

import { useEffect, useState } from "react";

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

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [labType, setLabType] = useState("basic");
  const [city, setCity] = useState("Mumbai");
  const [budget, setBudget] = useState("1000000");

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
          <p className="mt-1 text-sm text-muted-foreground">Select lab type, city, and budget to generate your roadmap.</p>
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

  if (onboarding) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold text-foreground">Onboarding</h1>
        <div className="mt-8 max-w-md space-y-4">
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
            <label className="block text-sm font-medium text-foreground">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">Budget (₹)</label>
            <input
              type="text"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>
          <button
            onClick={generateRoadmap}
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground"
          >
            Generate roadmap
          </button>
        </div>
      </div>
    );
  }

  const tasks = roadmap?.tasks ?? [];
  const start = roadmap?.timeline?.start ? new Date(roadmap.timeline.start).toLocaleDateString() : "—";
  const end = roadmap?.timeline?.end ? new Date(roadmap.timeline.end).toLocaleDateString() : "—";

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground">Setup Roadmap</h1>
      <p className="mt-1 text-muted-foreground">Track your setup timeline and tasks.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Progress</span>
          <p className="text-2xl font-bold text-primary">{roadmap?.progress ?? 0}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Estimated cost</span>
          <p className="text-2xl font-bold text-foreground">₹{(roadmap?.estimatedCost ?? 0).toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Timeline</span>
          <p className="font-medium text-foreground">{start} – {end}</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="font-semibold text-foreground">Tasks</h2>
        <ul className="mt-4 space-y-2">
          {tasks.map((task, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div>
                <span className="font-medium text-foreground">{task.title}</span>
                {task.module && <span className="ml-2 text-sm text-muted-foreground">({task.module})</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  task.status === "completed" ? "bg-accent/20 text-accent" :
                  task.status === "in_progress" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
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
    </div>
  );
}
