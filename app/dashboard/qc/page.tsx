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
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { Plus, ClipboardCheck, Activity, BookOpen, ShieldCheck, ListChecks, FileText } from "lucide-react";

interface QCLog {
  _id: string;
  testName: string;
  value: number;
  controlRange: { min: number; max: number };
  status: string;
  correctiveAction?: string;
  createdAt: string;
}

const IQC_STATUS = [
  { test: "Complete Blood Count (CBC)", control: "Tri-Level", lastRun: "08:30 AM", status: "Passed", westgard: "Within 2SD" },
  { test: "Biochemistry Profile", control: "Level 1 & 2", lastRun: "08:45 AM", status: "Warning", westgard: "1-3S Violation" },
  { test: "HbA1c (HPLC)", control: "Normal/Abnormal", lastRun: "09:00 AM", status: "Passed", westgard: "Within 1SD" },
];

const SOP_CATEGORIES = [
  { title: "Pre-Analytical", items: ["Phlebotomy & Sample Collection", "Sample Rejection Criteria", "Specimen Transport & Storage"] },
  { title: "Analytical", items: ["Equipment Calibration Log", "Reagent Preparation & Stability", "IQC Performance & LJ Charts"] },
  { title: "Post-Analytical", items: ["Critical Value Notification", "Report Validation Protocol", "Amendment of Reports"] },
];

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

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Quality Control & SOPs</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">QMS Framework aligned with ISO 15189:2022</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
            <ClipboardCheck size={18} /> Internal Audit
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> New SOP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="IQC Daily Compliance">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-black text-slate-900">92%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Monthly IQC Adherence</p>
              </div>
              <Badge variant="success">Pass</Badge>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[92%]" />
            </div>
          </div>
        </Card>
        <Card title="EQAS / PT Participation">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">RIQAS</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">Current Scheme: Hematology & Chemistry</p>
            </div>
          </div>
        </Card>
        <Card title="NABL Readiness">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">Level 4</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">Document Control & Management Review</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Daily Internal Quality Control (IQC)" icon={Activity}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Test Parameter</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Run</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Westgard Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {IQC_STATUS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="py-4">
                        <p className="font-bold text-slate-800 text-sm">{row.test}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{row.control}</p>
                      </td>
                      <td className="py-4 text-[11px] font-bold text-slate-600">{row.lastRun}</td>
                      <td className="py-4">
                        <Badge variant={row.status === "Passed" ? "success" : "warning"}>{row.status}</Badge>
                      </td>
                      <td className="py-4 text-right">
                        <span className={`text-[11px] font-black ${row.status === "Passed" ? "text-emerald-600" : "text-amber-600"}`}>{row.westgard}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-[11px] font-black uppercase tracking-widest hover:border-blue-300 hover:text-blue-500 transition-all">
              View All Levey-Jennings (LJ) Charts
            </button>
          </Card>

          <Card title="Digital SOP Library" icon={BookOpen}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SOP_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest px-1">{cat.title}</p>
                  <div className="space-y-2">
                    {cat.items.map((item, iIdx) => (
                      <div key={iIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all group cursor-pointer">
                        <p className="text-[11px] font-bold text-slate-700 leading-tight group-hover:text-blue-600">{item}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[9px] font-black text-slate-400 uppercase">v1.2</span>
                          <FileText size={12} className="text-slate-300 group-hover:text-blue-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Patho.ai Audit Insight" icon={ShieldCheck}>
            <div className="p-5 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-blue-400">
                  <Activity size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Live QC Monitoring</span>
                </div>
                <p className="text-sm font-bold leading-relaxed">
                  Detected a downward trend in Biochemistry Level 2 control for Creatinine over the last 4 runs. Recommend checking reagent expiration and recalibrating the analyzer.
                </p>
                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-1.5 bg-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-colors">
                    Recalibrate Now
                  </button>
                  <button className="px-3 py-1.5 bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                <ShieldCheck size={120} />
              </div>
            </div>
          </Card>

          <Card title="NABL Documentation" icon={ListChecks}>
            <div className="space-y-4">
              {[
                { label: "Quality Manual (Level 1)", status: "Completed" },
                { label: "Safety Manual (BMW)", status: "Completed" },
                { label: "Internal Audit Record", status: "Pending" },
                { label: "Management Review Log", status: "Overdue" },
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{doc.label}</span>
                  <Badge variant={doc.status === "Completed" ? "success" : doc.status === "Pending" ? "warning" : "danger"}>{doc.status}</Badge>
                </div>
              ))}
              <button className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                Download NABL Checklist
              </button>
            </div>
          </Card>
        </div>
      </div>

      {showForm && (
        <Card title="Log QC value">
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Test name</label>
              <input type="text" value={testName} onChange={(e) => setTestName(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Value</label>
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-foreground">Control min</label>
                <input type="number" value={min} onChange={(e) => setMin(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground">Control max</label>
                <input type="number" value={max} onChange={(e) => setMax(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Corrective action (if OOR)</label>
              <input type="text" value={correctiveAction} onChange={(e) => setCorrectiveAction(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="Optional" />
            </div>
            <button onClick={submitLog} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Add log
            </button>
          </div>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card title="QC trend (Hb)">
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
        </Card>
      )}

      <Card title="Recent QC logs">
        <ul className="space-y-2">
          {logs.slice(0, 15).map((log) => (
            <li key={log._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3">
              <div>
                <span className="font-medium text-foreground">{log.testName}</span>
                <span className="ml-2 text-sm text-muted-foreground">{log.value} ({log.controlRange.min}-{log.controlRange.max})</span>
              </div>
              <Badge variant={log.status === "out_of_range" ? "danger" : "success"}>{log.status}</Badge>
              {log.correctiveAction && <p className="w-full text-sm text-muted-foreground">{log.correctiveAction}</p>}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
