import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth-options";
import { Card } from "@/components/dashboard/Card";
import { ActiveTasks } from "@/components/dashboard/ActiveTasks";
import { SetupProgress } from "@/components/dashboard/SetupProgress";
import {
  Map,
  ShieldCheck,
  FileCheck,
  Wrench,
  BookOpen,
  Users,
  Award,
  Activity,
  TrendingUp,
  AlertTriangle,
  Layers,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    href: "/dashboard/roadmap",
    label: "Setup Roadmap",
    description: "Track your lab setup timeline, milestones, and pending tasks.",
    icon: Map,
    color: "blue",
  },
  {
    href: "/dashboard/licensing",
    label: "Licensing",
    description: "Apply, track, and renew all state and central lab licenses.",
    icon: FileCheck,
    color: "indigo",
  },
  {
    href: "/dashboard/equipment",
    label: "Equipment",
    description: "Plan CAPEX, compare vendors, and manage your analyzer list.",
    icon: Wrench,
    color: "violet",
  },
  {
    href: "/dashboard/guide",
    label: "Setup Guide",
    description: "Step-by-step walkthroughs for layout, zones, and compliance.",
    icon: BookOpen,
    color: "sky",
  },
  {
    href: "/dashboard/staff",
    label: "Staffing & HR",
    description: "Role requirements, salary benchmarks, and hiring checklists.",
    icon: Users,
    color: "emerald",
  },
  {
    href: "/dashboard/nabl",
    label: "NABL Accreditation",
    description: "Manage your ISO 15189 documentation and NABL audit readiness.",
    icon: Award,
    color: "amber",
  },
  {
    href: "/dashboard/operations",
    label: "Operations",
    description: "Live sample tracking, TAT compliance, and BMW waste records.",
    icon: Activity,
    color: "rose",
  },
];

const colorMap: Record<string, { bg: string; icon: string; border: string; label: string }> = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600",   border: "border-blue-100",   label: "text-blue-600" },
  indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", border: "border-indigo-100", label: "text-indigo-600" },
  violet: { bg: "bg-violet-50", icon: "text-violet-600", border: "border-violet-100", label: "text-violet-600" },
  sky:    { bg: "bg-sky-50",    icon: "text-sky-600",    border: "border-sky-100",    label: "text-sky-600" },
  emerald:{ bg: "bg-emerald-50",icon: "text-emerald-600",border: "border-emerald-100",label: "text-emerald-600" },
  amber:  { bg: "bg-amber-50",  icon: "text-amber-600",  border: "border-amber-100",  label: "text-amber-600" },
  rose:   { bg: "bg-rose-50",   icon: "text-rose-600",   border: "border-rose-100",   label: "text-rose-600" },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-8 p-6 md:p-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, <span className="font-semibold text-foreground">{session?.user?.name ?? "User"}</span>. Here&apos;s your lab setup status.
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Setup Progress" subtitle="Overall Roadmap Completion">
          <SetupProgress />
        </Card>

        <Card title="NABL Accreditation" subtitle="ISO 15189 Readiness">
          <div className="space-y-3 py-1">
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Award size={18} className="text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                Track your document checklist, proficiency tests, and audit schedule.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-black text-slate-800">Docs</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Checklist</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-black text-slate-800">Tests</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PT / IQC</p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-black text-slate-800">Audits</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Schedule</p>
              </div>
            </div>
            <Link href="/dashboard/nabl" className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors">
              Open NABL Module <ArrowRight size={12} />
            </Link>
          </div>
        </Card>

        <Card title="Compliance Health" subtitle="License & Regulatory Status" className="md:col-span-1">
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700">CEA Application</span>
              </div>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">Applied</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-sm font-semibold text-slate-700">Fire Safety NOC</span>
              </div>
              <span className="text-xs font-black text-amber-600 uppercase tracking-wider">Pending</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-700">BMW Authorization</span>
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">Not Started</span>
            </div>
            <Link href="/dashboard/licensing" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors mt-1">
              Manage Licenses <ArrowRight size={12} />
            </Link>
          </div>
        </Card>
      </div>

      {/* Active tasks + AI insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Active Tasks" icon={Map}>
          <ActiveTasks />
        </Card>

        <Card title="SetupAI Insights" icon={Layers}>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1.5 text-blue-700">
                  <TrendingUp size={15} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Equipment Tip</span>
                </div>
                <p className="text-sm text-blue-800 font-semibold leading-relaxed">
                  A 5-part Hematology Analyzer covers 80% of test demand for a mid-size lab. Consider shared CAPEX with a nearby collection center.
                </p>
              </div>
              <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <Wrench size={56} />
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 relative group overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1.5 text-amber-700">
                  <Award size={15} />
                  <span className="text-[10px] font-black uppercase tracking-widest">NABL Alert</span>
                </div>
                <p className="text-sm text-amber-800 font-semibold leading-relaxed">
                  Quality Policy and Internal Audit Schedule must be finalised at least 6 months before applying for NABL assessment.
                </p>
              </div>
              <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award size={56} />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 relative group overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1.5 text-emerald-700">
                  <Users size={15} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Staffing Reminder</span>
                </div>
                <p className="text-sm text-emerald-800 font-semibold leading-relaxed">
                  An MD Pathologist must be on-roll before you can apply for NABL or Clinical Establishment registration in most states.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Module grid */}
      <div>
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">All Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => {
            const c = colorMap[mod.color];
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className={`group rounded-2xl border ${c.border} ${c.bg} p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-white shadow-sm border ${c.border}`}>
                    <Icon size={20} className={c.icon} />
                  </div>
                  <ArrowRight size={14} className={`${c.label} opacity-0 group-hover:opacity-100 transition-opacity mt-1`} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">{mod.label}</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{mod.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Plan: <span className="font-semibold text-foreground capitalize">{session?.user?.subscriptionTier ?? "free"}</span>
      </p>
    </div>
  );
}
