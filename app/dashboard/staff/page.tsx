"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { Users, GraduationCap, HeartPulse, ShieldCheck, UserPlus, AlertCircle, TrendingUp } from "lucide-react";

interface StaffMember {
  _id: string;
  role: string;
  qualification?: string;
  salaryBenchmark?: number;
}

const ROLES = ["Pathologist", "Lab Technician", "Phlebotomist", "Front Desk Executive", "Quality Manager"];

const STATIC_STAFF = [
  { name: "Dr. Ananya Sharma", role: "Pathologist-in-Charge", qual: "MD Pathology", status: "Onboarded", health: "Vaccinated" },
  { name: "Suresh Kumar", role: "Quality Manager", qual: "M.Sc Life Sciences + ISO 15189", status: "Onboarded", health: "Vaccinated" },
  { name: "Rahul Verma", role: "Senior Technician", qual: "BMLT", status: "Onboarded", health: "Dose 2 Pending" },
  { name: "Priya Singh", role: "Lab Technician", qual: "DMLT", status: "Hiring", health: "N/A" },
  { name: "TBD", role: "Lab Attendant", qual: "10th Pass + BMW Trained", status: "Sourcing", health: "N/A" },
];

const MANDATORY_TRAINING = [
  { title: "BMW Management & Segregation", status: "Done", date: "Feb 10" },
  { title: "Infection Control & PPE Usage", status: "Done", date: "Feb 12" },
  { title: "Fire Safety & Evacuation Drill", status: "Pending", date: "Feb 25" },
  { title: "Needle Stick Injury Protocol", status: "Done", date: "Feb 15" },
];

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

  const displayStaff = staff.length > 0 ? staff.map((s) => ({ name: s.role, role: s.role, qual: s.qualification ?? "", status: "Onboarded", health: "—" })) : STATIC_STAFF;

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
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Staffing & HR Management</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Regulatory compliance for healthcare personnel</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> Add New Role
          </button>
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
            <GraduationCap size={18} /> Schedule Training
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Onboarding Funnel">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-black text-slate-900">3 / 5</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Positions Filled</p>
              </div>
              <Badge variant="warning">2 Hires Pending</Badge>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[60%]" />
            </div>
          </div>
        </Card>
        <Card title="Staff Health Status">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <HeartPulse size={24} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">80%</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">Hepatitis-B Vaccination Coverage</p>
            </div>
          </div>
        </Card>
        <Card title="Compliance Training">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">3 / 4</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">Mandatory Modules Completed</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Staff Directory & Qualifications" icon={Users}>
            <div className="space-y-4">
              {displayStaff.map((person, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/10 transition-all group">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-lg">
                      {typeof person.name === "string" && person.name !== "TBD" ? person.name[0] : "?"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{person.name}</h4>
                      <p className="text-[11px] text-slate-600 font-bold uppercase tracking-tight">{person.role}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">{person.qual}</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end gap-2">
                    <Badge variant={person.status === "Onboarded" ? "success" : person.status === "Hiring" ? "warning" : "slate"}>{person.status}</Badge>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${person.health === "Vaccinated" ? "text-emerald-600" : "text-amber-600"}`}>{person.health}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Training Tracker" icon={GraduationCap}>
            <div className="space-y-4">
              {MANDATORY_TRAINING.map((t, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${t.status === "Done" ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`} />
                    <span className="text-xs font-bold text-slate-700">{t.title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{t.date}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-100">
                <div className="p-4 bg-slate-900 rounded-2xl text-white">
                  <div className="flex items-center gap-2 mb-2 text-blue-400">
                    <AlertCircle size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">NABL Alert</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed">
                    NABL 112A requires the Quality Manager to complete a 4-day ISO 15189 training course. Ensure Suresh&apos;s certificate is uploaded by next audit.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Train.ai Staffing Insight" icon={TrendingUp}>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[11px] font-bold text-emerald-800 leading-tight">
                Predicted spike in Viral fever tests (Nov-Dec) suggests hiring an additional Contract Phlebotomist for the morning shift (6 AM - 10 AM).
              </p>
              <button className="mt-3 text-[10px] font-black text-emerald-600 uppercase hover:underline">
                View Seasonal Roster Plan
              </button>
            </div>
          </Card>
        </div>
      </div>

      {showForm && (
        <Card title="Add role">
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2">
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Qualification (optional)</label>
              <input type="text" value={qualification} onChange={(e) => setQualification(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="e.g. DMLT" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Salary benchmark ₹ (optional)</label>
              <input type="number" value={salaryBenchmark} onChange={(e) => setSalaryBenchmark(e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="e.g. 25000" />
            </div>
            <button onClick={addStaff} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              Add
            </button>
          </div>
        </Card>
      )}

      <Card title="Offer letter template">
        <p className="text-sm text-muted-foreground">Use your preferred template; attach offer letter placeholder here for compliance.</p>
        <p className="mt-2 text-xs text-muted-foreground">[Placeholder: Offer letter template upload / link]</p>
      </Card>
    </div>
  );
}
