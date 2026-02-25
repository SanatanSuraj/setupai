"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { FileCheck, Plus } from "lucide-react";

interface License {
  _id: string;
  type: string;
  state: string;
  status: string;
  renewalDate?: string;
  documents: { name: string; url: string }[];
}

export default function LicensingPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("Clinical Establishment");
  const [state, setState] = useState("Maharashtra");

  useEffect(() => {
    fetch("/api/licenses")
      .then((r) => r.json())
      .then(setLicenses)
      .finally(() => setLoading(false));
  }, []);

  const addLicense = async () => {
    const res = await fetch("/api/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, state, status: "pending" }),
    });
    if (res.ok) {
      const newLicense = await res.json();
      setLicenses((prev) => [newLicense, ...prev]);
      setShowForm(false);
    }
  };

  const statusVariant = (s: string) => (s === "approved" ? "success" : s === "applied" ? "info" : "slate");

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
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Licensing & Compliance</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">State-based checklists, document uploads, and renewal reminders.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700"
        >
          <Plus size={18} /> {showForm ? "Cancel" : "Add license"}
        </button>
      </div>

      {showForm && (
        <Card title="Add license">
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
              >
                <option value="Clinical Establishment">Clinical Establishment</option>
                <option value="BMW">BMW</option>
                <option value="Fire NOC">Fire NOC</option>
                <option value="Trade License">Trade License</option>
                <option value="NABL">NABL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
              />
            </div>
            <button onClick={addLicense} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Add
            </button>
          </div>
        </Card>
      )}

      <Card title="License tracker" icon={FileCheck}>
        {licenses.length === 0 && !showForm && (
          <p className="text-muted-foreground">No licenses yet. Add one to track compliance.</p>
        )}
        <div className="space-y-4">
          {licenses.map((lic) => (
            <div
              key={lic._id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-slate-50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-slate-800">{lic.type}</h3>
                <p className="text-sm text-slate-500">{lic.state}</p>
                {lic.renewalDate && (
                  <p className="text-xs text-slate-400">Renewal: {new Date(lic.renewalDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">{lic.documents?.length ?? 0} documents</span>
                <Badge variant={statusVariant(lic.status)}>{lic.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
