import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth-options";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { ActiveTasks } from "@/components/dashboard/ActiveTasks";
import { SetupProgress } from "@/components/dashboard/SetupProgress";
import {
  Map,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Layers,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back, {session?.user?.name ?? "User"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Setup Progress" subtitle="Overall Roadmap Completion">
          <SetupProgress />
        </Card>

        <Card title="Market Potential" subtitle="Train.ai National Analysis">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-500" />
              <span className="text-xl font-black text-emerald-600 tracking-tight">+18% Demand</span>
            </div>
            <p className="text-[10px] md:text-xs text-slate-600 leading-relaxed font-medium">
              High growth in <span className="text-slate-900 font-bold">Preventive Wellness</span> packages nationally. Wellness.ai suggests adding Vitamin-D and HbA1c to your launch menu.
            </p>
            <Link
              href="/dashboard/finance"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View Demand Heatmap →
            </Link>
          </div>
        </Card>

        <Card
          title="Compliance Health"
          subtitle="Patho.ai National Audit Score"
          className="md:col-span-2 lg:col-span-1"
        >
          <div className="space-y-4 text-center py-2">
            <div className="inline-flex items-center justify-center p-5 bg-emerald-50 rounded-full border-[6px] border-emerald-100 shadow-sm">
              <ShieldCheck size={36} className="text-emerald-600" />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm md:text-lg tracking-tight">Ready for NABL</h4>
              <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">7/10 Critical Docs Verified</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Active Tasks" icon={Map}>
          <ActiveTasks />
        </Card>

        <Card title="MobiLab Intelligence" icon={Layers}>
          <div className="space-y-4">
            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-blue-700">
                  <BarChart3 size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Train.ai Forecast</span>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed font-bold">
                  Predictive data indicates a <span className="text-blue-700 underline underline-offset-4 decoration-2">22% national spike</span> in viral fever tests starting mid-November.
                </p>
              </div>
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={64} />
              </div>
            </div>
            <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 shadow-sm relative group overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 text-purple-700">
                  <ShieldCheck size={18} />
                  <span className="text-[11px] font-black uppercase tracking-widest">Patho.ai Insight</span>
                </div>
                <p className="text-sm text-purple-800 leading-relaxed font-bold">
                  National BMW Guidelines 2026 released. We&apos;ve updated your color-coding checklist automatically.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href="/dashboard/roadmap"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 flex-1 min-w-[140px]"
        >
          <h2 className="font-semibold text-foreground">Roadmap</h2>
          <p className="mt-1 text-sm text-muted-foreground">Setup timeline and tasks</p>
        </Link>
        <Link
          href="/dashboard/licensing"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 flex-1 min-w-[140px]"
        >
          <h2 className="font-semibold text-foreground">Licensing</h2>
          <p className="mt-1 text-sm text-muted-foreground">Compliance and documents</p>
        </Link>
        <Link
          href="/dashboard/equipment"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 flex-1 min-w-[140px]"
        >
          <h2 className="font-semibold text-foreground">Equipment</h2>
          <p className="mt-1 text-sm text-muted-foreground">Planner and CAPEX</p>
        </Link>
        <Link
          href="/dashboard/staff"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 flex-1 min-w-[140px]"
        >
          <h2 className="font-semibold text-foreground">Staff</h2>
          <p className="mt-1 text-sm text-muted-foreground">Roles and benchmarks</p>
        </Link>
        <Link
          href="/dashboard/qc"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 flex-1 min-w-[140px]"
        >
          <h2 className="font-semibold text-foreground">QC & SOP</h2>
          <p className="mt-1 text-sm text-muted-foreground">Quality control and SOPs</p>
        </Link>
        <Link
          href="/dashboard/finance"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 flex-1 min-w-[140px]"
        >
          <h2 className="font-semibold text-foreground">Finance</h2>
          <p className="mt-1 text-sm text-muted-foreground">CAPEX, OPEX, break-even</p>
        </Link>
        <Link
          href="/dashboard/operations"
          className="rounded-xl border border-border bg-card p-6 shadow-sm hover:border-primary/30 flex-1 min-w-[140px]"
        >
          <h2 className="font-semibold text-foreground">Operations</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sample tracking and TAT</p>
        </Link>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Plan: <span className="font-medium text-foreground">{session?.user?.subscriptionTier ?? "free"}</span>
      </p>
    </div>
  );
}
