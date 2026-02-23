"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface QCLog {
  _id: string;
  testName: string;
  value: number;
  controlRange: { min: number; max: number };
  status: string;
  correctiveAction?: string;
  createdAt: string;
}

export default function QCPage() {
  const [logs, setLogs] = useState<QCLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [testName, setTestName] = useState("Hb");
  const [value, setValue] = useState("");
  const [min, setMin] = useState("12");
  const [max, setMax] = useState("16");
  const [correctiveAction, setCorrectiveAction] = useState("");

  useEffect(() => {
    fetch("/api/qc")
      .then((r) => r.json())
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  const submitLog = async () => {
    const v = parseFloat(value);
    if (Number.isNaN(v)) return;
    const res = await fetch("/api/qc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testName,
        value: v,
        controlRange: { min: parseFloat(min) || 0, max: parseFloat(max) || 100 },
        correctiveAction: correctiveAction || undefined,
      }),
    });
    if (res.ok) {
      const newLog = await res.json();
      setLogs((prev) => [newLog, ...prev]);
      setShowForm(false);
      setValue("");
    }
  };

  const chartData = logs
    .filter((l) => l.testName === "Hb")
    .slice(0, 20)
    .reverse()
    .map((l, i) => ({
      index: i + 1,
      value: l.value,
      min: l.controlRange.min,
      max: l.controlRange.max,
      date: new Date(l.createdAt).toLocaleDateString(),
    }));

  const outOfRangeCount = logs.filter((l) => l.status === "out_of_range").length;

  if (loading) return <div className="p-6 md:p-8"><p className="text-muted-foreground">Loading…</p></div>;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground">QC & SOP</h1>
      <p className="mt-1 text-muted-foreground">Upload QC values, validate against control range, corrective actions.</p>
      <div className="mt-6 flex gap-4">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Total logs</span>
          <p className="text-2xl font-bold text-foreground">{logs.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Out of range</span>
          <p className="text-2xl font-bold text-accent">{outOfRangeCount}</p>
        </div>
      </div>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {showForm ? "Cancel" : "+ Log QC value"}
      </button>
      {showForm && (
        <div className="mt-4 max-w-md rounded-xl border border-border bg-card p-4">
          <label className="block text-sm font-medium text-foreground">Test name</label>
          <input
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
          <label className="mt-3 block text-sm font-medium text-foreground">Value</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-foreground">Control min</label>
              <input
                type="number"
                value={min}
                onChange={(e) => setMin(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Control max</label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </div>
          </div>
          <label className="mt-3 block text-sm font-medium text-foreground">Corrective action (if OOR)</label>
          <input
            type="text"
            value={correctiveAction}
            onChange={(e) => setCorrectiveAction(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="Optional"
          />
          <button
            onClick={submitLog}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add log
          </button>
        </div>
      )}
      {chartData.length > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold text-foreground">QC trend (Hb)</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} name="Value" />
                <Line type="monotone" dataKey="min" stroke="var(--muted-foreground)" strokeDasharray="4 4" name="Min" />
                <Line type="monotone" dataKey="max" stroke="var(--muted-foreground)" strokeDasharray="4 4" name="Max" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="mt-8">
        <h2 className="font-semibold text-foreground">Recent QC logs</h2>
        <ul className="mt-4 space-y-2">
          {logs.slice(0, 15).map((log) => (
            <li
              key={log._id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div>
                <span className="font-medium text-foreground">{log.testName}</span>
                <span className="ml-2 text-sm text-muted-foreground">{log.value} ({log.controlRange.min}-{log.controlRange.max})</span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                log.status === "out_of_range" ? "bg-red-500/20 text-red-600" : "bg-accent/20 text-accent"
              }`}>
                {log.status}
              </span>
              {log.correctiveAction && <p className="w-full text-sm text-muted-foreground">{log.correctiveAction}</p>}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground">SOP builder</h3>
        <p className="mt-1 text-sm text-muted-foreground">Rich text SOP editor placeholder. Pre-built templates for sample handling, calibration, temperature logs.</p>
        <p className="mt-2 text-xs text-muted-foreground">[Placeholder: SOP rich text editor]</p>
      </div>
    </div>
  );
}
