"use client";

import Link from "next/link";
import {
  FileText,
  Sparkles,
  ShieldCheck,
  Search,
  ArrowRight,
  Clock,
} from "lucide-react";

const upcoming = [
  {
    title: "Clinical Establishment Act application",
    detail: "Auto-fill state-specific CEA registration with your lab profile.",
    icon: FileText,
  },
  {
    title: "Biomedical Waste Management plan",
    detail: "Comprehensive BMW plan generated per BMW Rules 2016.",
    icon: ShieldCheck,
  },
  {
    title: "Quality Manual (ISO 15189:2022)",
    detail: "NABL-aligned manual with editable SOPs and policies.",
    icon: FileText,
  },
  {
    title: "AI document validation",
    detail: "Upload submitted documents — get instant compliance feedback.",
    icon: Sparkles,
  },
  {
    title: "Gap analysis",
    detail: "Spot missing documents against the full statutory checklist.",
    icon: Search,
  },
];

export default function DocumentsPage() {
  return (
    <div className="space-y-6 p-6 md:p-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600">
          <FileText size={20} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
            Documents
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Generate regulatory documents and validate compliance submissions.
          </p>
        </div>
      </div>

      {/* Coming-soon hero */}
      <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8 md:p-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-200">
            <Clock size={11} />
            Coming soon
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mt-4">
            AI-assisted document generation is on the way.
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-3 leading-relaxed">
            We&apos;re building a one-click generator for every statutory
            document an Indian diagnostic lab needs — pre-filled from your
            organisation profile, with AI validation and gap analysis baked in.
            In the meantime, track every document requirement in the Go Live
            Checklist.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/go-live"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
            >
              Open Go Live Checklist
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* What's coming */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 mb-3">
          What&apos;s coming
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcoming.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xs"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
