"use client";

import { useEffect, useState } from "react";

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

  const statusColor = (s: string) =>
    s === "approved" ? "bg-accent/20 text-accent" : s === "applied" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground";

  if (loading) return <div className="p-6 md:p-8"><p className="text-muted-foreground">Loading…</p></div>;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground">Licensing & Compliance</h1>
      <p className="mt-1 text-muted-foreground">State-based checklists, document uploads, and renewal reminders.</p>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {showForm ? "Cancel" : "+ Add license"}
      </button>
      {showForm && (
        <div className="mt-4 max-w-md rounded-xl border border-border bg-card p-4">
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
          <label className="mt-3 block text-sm font-medium text-foreground">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
          <button
            onClick={addLicense}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add
          </button>
        </div>
      )}
      <div className="mt-8 space-y-4">
        {licenses.length === 0 && !showForm && (
          <p className="text-muted-foreground">No licenses yet. Add one to track compliance.</p>
        )}
        {licenses.map((lic) => (
          <div
            key={lic._id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div>
              <h3 className="font-semibold text-foreground">{lic.type}</h3>
              <p className="text-sm text-muted-foreground">{lic.state}</p>
              {lic.renewalDate && (
                <p className="text-xs text-muted-foreground">Renewal: {new Date(lic.renewalDate).toLocaleDateString()}</p>
              )}
            </div>
            <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor(lic.status)}`}>
              {lic.status}
            </span>
            <span className="text-sm text-muted-foreground">{lic.documents?.length ?? 0} documents</span>
          </div>
        ))}
      </div>
    </div>
  );
}
