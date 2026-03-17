"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import {
  Users,
  GraduationCap,
  HeartPulse,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  TrendingUp,
  Pencil,
  Save,
  X,
  Trash2,
} from "lucide-react";

type StaffRole = "pathologist" | "technician" | "phlebotomist" | "receptionist" | "manager";
type TrainingStatus = "pending" | "in-progress" | "certified" | "expired";

interface StaffMember {
  _id: string;
  name: string;
  role: StaffRole;
  qualification?: string;
  salary?: number;
  trainingStatus?: TrainingStatus;
  trainingModules?: string[];
  joinedDate?: string;
  isMandatory?: boolean;
}

const ROLE_OPTIONS: Array<{ id: StaffRole; label: string }> = [
  { id: "pathologist", label: "Pathologist" },
  { id: "technician", label: "Lab Technician" },
  { id: "phlebotomist", label: "Phlebotomist" },
  { id: "receptionist", label: "Front Desk" },
  { id: "manager", label: "Quality/Operations Manager" },
];

const TRAINING_OPTIONS: TrainingStatus[] = ["pending", "in-progress", "certified", "expired"];

const MANDATORY_TRAINING = [
  { title: "BMW Management & Segregation", status: "Done", date: "Feb 10" },
  { title: "Infection Control & PPE Usage", status: "Done", date: "Feb 12" },
  { title: "Fire Safety & Evacuation Drill", status: "Pending", date: "Feb 25" },
  { title: "Needle Stick Injury Protocol", status: "Done", date: "Feb 15" },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("technician");
  const [qualification, setQualification] = useState("");
  const [salary, setSalary] = useState("");
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>("pending");
  const [isMandatory, setIsMandatory] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<StaffMember>>({});

  useEffect(() => {
    fetch("/api/staff")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setStaff(Array.isArray(data) ? data : []))
      .catch(() => setStaff([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = staff.length;
    const mandatory = staff.filter((s) => s.isMandatory).length;
    const certified = staff.filter((s) => s.trainingStatus === "certified").length;
    const pending = staff.filter((s) => (s.trainingStatus ?? "pending") !== "certified").length;
    return { total, mandatory, certified, pending };
  }, [staff]);

  const addStaff = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Please enter a staff name.");
      return;
    }
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        role,
        qualification: qualification || "",
        salary: salary ? parseInt(salary, 10) : 0,
        trainingStatus,
        isMandatory,
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setStaff((prev) => [created, ...prev]);
      setShowForm(false);
      setName("");
      setQualification("");
      setSalary("");
      setTrainingStatus("pending");
      setIsMandatory(false);
    } else {
      const data = await res.json().catch(() => null);
      setError((data && typeof data.error === "string" && data.error) || "Failed to add staff.");
    }
  };

  const startEdit = (m: StaffMember) => {
    setEditingId(m._id);
    setDraft({
      name: m.name,
      role: m.role,
      qualification: m.qualification ?? "",
      salary: m.salary ?? 0,
      trainingStatus: m.trainingStatus ?? "pending",
      isMandatory: !!m.isMandatory,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setError(null);
    if (typeof draft.name === "string" && !draft.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    const res = await fetch(`/api/staff/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (res.ok) {
      const updated = await res.json();
      setStaff((prev) => prev.map((s) => (s._id === editingId ? { ...s, ...updated } : s)));
      cancelEdit();
    } else {
      const data = await res.json().catch(() => null);
      setError((data && typeof data.error === "string" && data.error) || "Failed to update staff.");
    }
  };

  const deleteMember = async (id: string) => {
    setError(null);
    const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
    if (res.ok) setStaff((prev) => prev.filter((s) => s._id !== id));
    else {
      const data = await res.json().catch(() => null);
      setError((data && typeof data.error === "string" && data.error) || "Failed to delete staff.");
    }
  };

  const trainingBadgeVariant = (s: TrainingStatus) =>
    s === "certified" ? "success" : s === "in-progress" ? "info" : s === "expired" ? "warning" : "slate";

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Staffing & HR Management</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Regulatory compliance for healthcare personnel</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> Add Staff
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Onboarding Funnel">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-black text-slate-900">{stats.total} / 5</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Positions Filled</p>
              </div>
              <Badge variant={stats.total >= 5 ? "success" : "warning"}>
                {stats.total >= 5 ? "Target Met" : `${Math.max(0, 5 - stats.total)} Hires Pending`}
              </Badge>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${Math.min(100, (stats.total / 5) * 100)}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Mandatory Roles">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats.mandatory}</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">Marked as mandatory by owner</p>
            </div>
          </div>
        </Card>

        <Card title="Compliance Training">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{stats.certified} / {Math.max(1, stats.total)}</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">Staff marked as certified</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Staff Directory (Editable)" icon={Users}>
            <div className="space-y-4">
              {staff.length === 0 && (
                <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 text-slate-600 text-sm">
                  No staff added yet. Click <span className="font-bold">Add Staff</span> to create your first entry.
                </div>
              )}

              {staff.map((m) => {
                const isEditing = editingId === m._id;
                const roleLabel = ROLE_OPTIONS.find((r) => r.id === m.role)?.label ?? m.role;
                const status = (m.trainingStatus ?? "pending") as TrainingStatus;
                return (
                  <div key={m._id} className="p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/10 transition-all">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black text-lg">
                          {m.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                value={(draft.name as string) ?? ""}
                                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800"
                                placeholder="Name"
                              />
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <select
                                  value={(draft.role as StaffRole) ?? "technician"}
                                  onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                >
                                  {ROLE_OPTIONS.map((r) => (
                                    <option key={r.id} value={r.id}>
                                      {r.label}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={(draft.trainingStatus as TrainingStatus) ?? "pending"}
                                  onChange={(e) => setDraft((d) => ({ ...d, trainingStatus: e.target.value }))}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                >
                                  {TRAINING_OPTIONS.map((t) => (
                                    <option key={t} value={t}>
                                      {t}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  value={(draft.qualification as string) ?? ""}
                                  onChange={(e) => setDraft((d) => ({ ...d, qualification: e.target.value }))}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                  placeholder="Qualification"
                                />
                                <input
                                  type="number"
                                  value={typeof draft.salary === "number" ? draft.salary : 0}
                                  onChange={(e) => setDraft((d) => ({ ...d, salary: Number(e.target.value) }))}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                  placeholder="Salary (₹/month)"
                                />
                              </div>
                              <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={!!draft.isMandatory}
                                  onChange={(e) => setDraft((d) => ({ ...d, isMandatory: e.target.checked }))}
                                  className="rounded border-slate-300"
                                />
                                Mandatory role
                              </label>
                            </div>
                          ) : (
                            <>
                              <h4 className="font-bold text-slate-800 text-sm truncate">
                                {m.name}
                                {m.isMandatory && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-700">
                                    Mandatory
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight">{roleLabel}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-1">
                                {m.qualification || "—"}
                                {typeof m.salary === "number" && m.salary > 0 ? ` • ₹${m.salary.toLocaleString()}/mo` : ""}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:justify-end">
                        {!isEditing && <Badge variant={trainingBadgeVariant(status)}>{status}</Badge>}
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-2"
                            >
                              <Save size={14} /> Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 flex items-center gap-2"
                            >
                              <X size={14} /> Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(m)}
                              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                              aria-label="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => deleteMember(m._id)}
                              className="p-2 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50"
                              aria-label="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-6">

          <Card title="Train.ai Staffing Insight" icon={TrendingUp}>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                Predicted spike in viral fever tests (Nov–Dec) suggests hiring an additional contract phlebotomist for the morning shift (6 AM – 10 AM).
              </p>
              <button className="mt-3 text-[10px] font-black text-emerald-600 uppercase hover:underline">
                View Seasonal Roster Plan
              </button>
            </div>
          </Card>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          
          {/* Modal Box */}
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 relative animate-fadeIn">
            
            {/* Close Button */}
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>

            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Add Staff (Owner Editable)
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  placeholder="e.g. Dr. Ananya Sharma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Qualification</label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Salary ₹/month</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Training status</label>
                <select
                  value={trainingStatus}
                  onChange={(e) => setTrainingStatus(e.target.value as TrainingStatus)}
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                >
                  {TRAINING_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isMandatory}
                  onChange={(e) => setIsMandatory(e.target.checked)}
                />
                Mandatory role
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={addStaff}
                  disabled={!name.trim()}
                  className="flex-1 rounded-lg bg-blue-600 text-white py-2 text-sm font-bold hover:bg-blue-700"
                >
                  Add Staff
                </button>

                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-lg border py-2 text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

