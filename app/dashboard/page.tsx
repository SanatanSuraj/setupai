import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth-options";
import { Card } from "@/components/dashboard/Card";
import { SetupProgress } from "@/components/dashboard/SetupProgress";
import { ComplianceHealthCard } from "@/components/dashboard/ComplianceHealthCard";
import { NablStatCard, NablSnapshotCard } from "@/components/dashboard/NablDashboardCards";
import {
  Map,
  ShieldCheck,
  FileCheck,
  Wrench,
  BookOpen,
  Users,
  Award,
  Activity,
  ArrowRight,
  FileText,
  Layers,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const modules = [
  {
    href: "/dashboard/roadmap",
    label: "Setup Roadmap",
    description: "Timeline, milestones, and pending tasks.",
    icon: Map,
    accent: "blue",
  },
  {
    href: "/dashboard/licensing",
    label: "Licensing",
    description: "Apply, track, and renew all lab licenses.",
    icon: FileCheck,
    accent: "indigo",
  },
  {
    href: "/dashboard/equipment",
    label: "Equipment",
    description: "CAPEX planning, vendor comparison, analyzers.",
    icon: Wrench,
    accent: "violet",
  },
  {
    href: "/dashboard/guide",
    label: "Setup Guide",
    description: "Step-by-step layout, zones, and compliance.",
    icon: BookOpen,
    accent: "sky",
  },
  {
    href: "/dashboard/staff",
    label: "Staffing & HR",
    description: "Roles, salary benchmarks, hiring checklists.",
    icon: Users,
    accent: "emerald",
  },
  {
    href: "/dashboard/nabl",
    label: "NABL Accreditation",
    description: "ISO 15189 documentation and audit readiness.",
    icon: Award,
    accent: "amber",
  },
  {
    href: "/dashboard/compliance",
    label: "Compliance Center",
    description: "BMW authorization, go-live gates, validation.",
    icon: ShieldCheck,
    accent: "teal",
  },
  {
    href: "/dashboard/documents",
    label: "Documents",
    description: "Generate CEA, BMW, Quality Manual. AI validation.",
    icon: FileText,
    accent: "orange",
  },
  {
    href: "/dashboard/operations",
    label: "Operations",
    description: "Live sample tracking, TAT, BMW waste records.",
    icon: Activity,
    accent: "rose",
  },
];

const accentMap: Record<string, { icon: string; bg: string; hover: string; text: string }> = {
  blue:    { icon: "text-blue-600",   bg: "bg-blue-50",   hover: "hover:border-blue-200",   text: "text-blue-600" },
  indigo:  { icon: "text-indigo-600", bg: "bg-indigo-50", hover: "hover:border-indigo-200", text: "text-indigo-600" },
  violet:  { icon: "text-violet-600", bg: "bg-violet-50", hover: "hover:border-violet-200", text: "text-violet-600" },
  sky:     { icon: "text-sky-600",    bg: "bg-sky-50",    hover: "hover:border-sky-200",    text: "text-sky-600" },
  emerald: { icon: "text-emerald-600",bg: "bg-emerald-50",hover: "hover:border-emerald-200",text: "text-emerald-600" },
  amber:   { icon: "text-amber-600",  bg: "bg-amber-50",  hover: "hover:border-amber-200",  text: "text-amber-600" },
  teal:    { icon: "text-teal-600",   bg: "bg-teal-50",   hover: "hover:border-teal-200",   text: "text-teal-600" },
  orange:  { icon: "text-orange-600", bg: "bg-orange-50", hover: "hover:border-orange-200", text: "text-orange-600" },
  rose:    { icon: "text-rose-600",   bg: "bg-rose-50",   hover: "hover:border-rose-200",   text: "text-rose-600" },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name ?? "there";
  const plan = session?.user?.subscriptionTier ?? "free";

  const renderStat = (s: {
    label: string;
    value: string;
    sub: string;
    color: string;
    icon: any;
    accent: string;
  }) => {
    const Icon = s.icon;
    const iconStyles: Record<string, string> = {
      slate: "bg-gray-100 text-gray-500",
      blue:  "bg-blue-50 text-blue-600",
      amber: "bg-amber-50 text-amber-600",
    };
    const iconClass = iconStyles[s.accent] ?? iconStyles.slate;
    return (
      <div key={s.label} className="stat-card">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 tracking-tight ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
            <Icon size={16} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 animate-fade-in-up">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600 ring-1 ring-blue-100">
              <Sparkles size={10} />
              AI-Powered Lab Setup
            </span>
            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500 capitalize">
              {plan}
            </span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
            Good morning, <span className="text-blue-600">{userName.split(" ")[0]}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here&apos;s your diagnostic lab setup overview.
          </p>
        </div>
        <Link href="/dashboard/documents" className="btn-primary shrink-0">
          <TrendingUp size={14} />
          Build Quality Manual
        </Link>
      </div>

      {/* ── KPI Stats Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label:  "Active Modules",
            value:  "9",
            sub:    "All systems online",
            color:  "text-gray-900",
            icon:   Layers,
            accent: "slate" as const,
          },
          {
            label:  "Setup Phase",
            value:  "Phase 1",
            sub:    "of 5 · Location",
            color:  "text-blue-700",
            icon:   Map,
            accent: "blue" as const,
          },
        ].map(renderStat)}

        <NablStatCard />

        {[
          {
            label:  "Licenses Pending",
            value:  "6",
            sub:    "to be filed",
            color:  "text-gray-900",
            icon:   FileCheck,
            accent: "slate" as const,
          },
        ].map(renderStat)}
      </div>

      {/* ── Main 3-column grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Setup Progress */}
        <Card title="Setup Progress" subtitle="Roadmap completion" icon={Map}>
          <SetupProgress />
        </Card>

        {/* NABL snapshot */}
        <NablSnapshotCard />

        {/* Compliance Health */}
        <Card title="Compliance Health" subtitle="Live gate status" icon={ShieldCheck}>
          <ComplianceHealthCard />
        </Card>
      </div>

      {/* ── Next Action Banner ─────────────────────────────────────────── */}
      <div className="flex items-start sm:items-center gap-4 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-200">
          <TrendingUp size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
            Recommended next action
          </p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">
            Build your Quality Manual &amp; Standard Operating Procedures
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Required for NABL ISO 15189 certification and CEA compliance
          </p>
        </div>
        <Link href="/dashboard/documents" className="btn-primary shrink-0 btn-sm">
          Start now <ArrowRight size={12} />
        </Link>
      </div>

      {/* ── Module Grid ────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="section-header mb-0">All Modules</p>
          <span className="text-xs text-gray-400">{modules.length} modules</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {modules.map((mod) => {
            const a = accentMap[mod.accent] ?? accentMap.blue;
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className={`group flex items-start gap-3.5 rounded-xl border border-gray-100 bg-white p-4
                  shadow-xs hover:shadow-card hover:border-gray-200 transition-all duration-150 ${a.hover}`}
              >
                {/* Icon */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.bg} mt-0.5`}>
                  <Icon size={16} className={a.icon} />
                </div>
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight truncate">
                      {mod.label}
                    </h3>
                    <ArrowRight
                      size={13}
                      className={`shrink-0 ${a.text} opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <CheckCircle2 size={10} className="text-gray-200" />
                    <span className="text-[10px] text-gray-400 font-medium">Not started</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
