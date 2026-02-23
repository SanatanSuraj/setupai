"use client";

import { useEffect, useState } from "react";

interface StaffMember {
  _id: string;
  role: string;
  qualification?: string;
  salaryBenchmark?: number;
}

const ROLES = ["Pathologist", "Lab Technician", "Phlebotomist", "Front Desk Executive", "Quality Manager"];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [role, setRole] = useState("Lab Technician");
  const [qualification, setQualification] = useState("");
  const [salaryBenchmark, setSalaryBenchmark] = useState("");

  useEffect(() => {
    fetch("/api/staff")
      .then((r) => r.json())
      .then(setStaff)
      .finally(() => setLoading(false));
  }, []);

  const addStaff = async () => {
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        qualification: qualification || undefined,
        salaryBenchmark: salaryBenchmark ? parseInt(salaryBenchmark, 10) : undefined,
      }),
    });
    if (res.ok) {
      const newMember = await res.json();
      setStaff((prev) => [newMember, ...prev]);
      setShowForm(false);
      setQualification("");
      setSalaryBenchmark("");
    }
  };

  if (loading) return <div className="p-6 md:p-8"><p className="text-muted-foreground">Loading…</p></div>;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground">Staffing</h1>
      <p className="mt-1 text-muted-foreground">Role templates, salary benchmarks, offer letter placeholders.</p>
      <button
        onClick={() => setShowForm(!showForm)}
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        {showForm ? "Cancel" : "+ Add role"}
      </button>
      {showForm && (
        <div className="mt-4 max-w-md rounded-xl border border-border bg-card p-4">
          <label className="block text-sm font-medium text-foreground">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <label className="mt-3 block text-sm font-medium text-foreground">Qualification (optional)</label>
          <input
            type="text"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="e.g. DMLT"
          />
          <label className="mt-3 block text-sm font-medium text-foreground">Salary benchmark ₹ (optional)</label>
          <input
            type="number"
            value={salaryBenchmark}
            onChange={(e) => setSalaryBenchmark(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="e.g. 25000"
          />
          <button
            onClick={addStaff}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add
          </button>
        </div>
      )}
      <div className="mt-8 space-y-3">
        {staff.length === 0 && !showForm && (
          <p className="text-muted-foreground">No staff roles added. Add roles to build your team plan.</p>
        )}
        {staff.map((s) => (
          <div
            key={s._id}
            className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
          >
            <div>
              <h3 className="font-semibold text-foreground">{s.role}</h3>
              {s.qualification && <p className="text-sm text-muted-foreground">{s.qualification}</p>}
            </div>
            {s.salaryBenchmark != null && (
              <span className="text-sm font-medium text-foreground">₹{s.salaryBenchmark.toLocaleString()}/mo</span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-xl border border-border bg-card p-4">
        <h3 className="font-semibold text-foreground">Offer letter template</h3>
        <p className="mt-1 text-sm text-muted-foreground">Use your preferred template; attach offer letter placeholder here for compliance.</p>
        <p className="mt-2 text-xs text-muted-foreground">[Placeholder: Offer letter template upload / link]</p>
      </div>
    </div>
  );
}
