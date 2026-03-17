"use client";

import { useState } from "react";
import { Card } from "@/components/dashboard/Card";
import {
  FileCheck,
  MapPin,
  Users,
  ChevronDown,
  Building2,
  Zap,
  Trash2,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

type Tab = "quick" | "comprehensive";

export default function GuidePage() {
  const [tab, setTab] = useState<Tab>("quick");
  const [openSection, setOpenSection] = useState<string | null>("1");

  const toggleSection = (id: string) => setOpenSection((s) => (s === id ? null : id));

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative z-10 p-8 md:p-12">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider mb-6">
            Noida, Uttar Pradesh
          </span>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
            Setting Up a Diagnostic Laboratory
          </h1>
          <p className="text-slate-300 mt-3 text-lg font-medium">
            Primary Healthtech Pvt. Ltd. (Mobilab)
          </p>
          <div className="flex items-center gap-2 mt-4 text-slate-400">
            <MapPin size={18} className="text-blue-400" />
            <span>E-12, Sector 6, Noida – 201301</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setTab("quick")}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
            tab === "quick"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Quick Guide
        </button>
        <button
          onClick={() => setTab("comprehensive")}
          className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${
            tab === "comprehensive"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Comprehensive Guide
        </button>
      </div>

      {tab === "quick" && (
        <div className="space-y-8">
          {/* 1. Services */}
          <Card title="1. Clinical Diagnostic Laboratory Offering" icon={Building2} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid gap-3 sm:grid-cols-2">
              {["Lipid, Liver & Kidney Profiles", "CBC (22 parameters)", "Anemia & Diabetes (HbA1c, Glucose)", "Future-ready: Iron, Electrolytes, Inflammation & Hematology"].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 2. Mandatory Compliance */}
          <Card title="2. Mandatory Legal & Regulatory Compliance" icon={FileCheck} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-3">
              {[
                { title: "Clinical Establishment Registration (CEA, 2010)", auth: "CMO, Gautam Buddh Nagar", desc: "Core license for running a diagnostic lab" },
                { title: "Shop & Establishment Registration", auth: "UP Labour Department", desc: "" },
                { title: "Biomedical Waste Authorization (BMW Rules, 2016)", auth: "UPPCB", desc: "CBWTF contract required" },
                { title: "Fire Safety NOC", auth: "Nivesh Mitra Portal", desc: "" },
                { title: "Business & Tax Registrations", auth: "GST, PAN, TAN", desc: "Company incorporation, Professional Tax if applicable" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm transition-all group">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 text-white text-sm font-black flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Authority: {item.auth}
                      {item.desc && ` — ${item.desc}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 3. Space & Infrastructure */}
          <Card title="3. Space & Infrastructure" icon={MapPin} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/30 border border-slate-100 mb-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommended Area</p>
              <p className="text-2xl font-black text-slate-900 mt-0.5">200–250 sq ft</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Key Zones</p>
                <div className="space-y-2">
                  {["Reception & Waiting", "Phlebotomy Room (privacy)", "Sample Processing Lab", "Reporting & QC Area", "BMW Storage (lockable)", "Utility & Storage", "Separate washrooms"].map((z) => (
                    <p key={z} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {z}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Core Infrastructure</p>
                <div className="space-y-2">
                  {["Stable power + UPS backup", "AC 20–25°C", "RO water supply", "Fire extinguishers, PPE, spill kits", "CCTV + data security"].map((i) => (
                    <p key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {i}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Staffing */}
          <Card title="4. Minimum Staffing Required" icon={Users} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-3">Mandatory</p>
                <div className="space-y-2">
                  {["Pathologist (MD/DNB/DCP) – Full-time or visiting", "2–3 Medical Lab Technicians (DMLT/BMLT)", "1 Lab Attendant"].map((r) => (
                    <p key={r} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 size={16} className="text-rose-500 shrink-0" />
                      {r}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Recommended</p>
                <div className="space-y-2">
                  {["Receptionist / Front desk", "Data entry / LIMS operator"].map((r) => (
                    <p key={r} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {r}
                    </p>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs font-bold text-amber-800">
                    ✔ Hepatitis-B vaccination for all lab staff
                  </p>
                  <p className="text-xs text-amber-700 mt-1">BMW, safety & SOP training mandatory</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 5. Equipment */}
          <Card title="5. Equipment – Keep It Lean" icon={Zap} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {["CBC Analyzer", "Semi-auto analyzer (Mobilab)", "Refrigerator, Deep Freezer", "Phlebotomy chairs, needle destroyer", "Barcode printer + scanner", "Computers + LIMS"].map((e) => (
                <div key={e} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
                  <Zap size={18} className="text-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{e}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 6. BMW */}
          <Card title="6. Biomedical Waste (Non-Negotiable)" icon={Trash2} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap gap-4 mb-4">
              {[
                { color: "Yellow", bg: "bg-yellow-400", label: "Infectious" },
                { color: "Red", bg: "bg-red-500", label: "Contaminated" },
                { color: "White", bg: "bg-slate-200 border border-slate-300", label: "Sharps" },
                { color: "Blue", bg: "bg-blue-500", label: "Glassware" },
              ].map(({ color, bg, label }) => (
                <div key={color} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${bg} shadow-inner`} />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{color}</p>
                    <p className="text-[10px] text-slate-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {["Daily segregation at source", "Contract with authorized CBWTF", "Maintain waste registers & annual UPPCB report", "Staff PPE + spill management kit"].map((b) => (
                <p key={b} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  {b}
                </p>
              ))}
            </div>
          </Card>

          {/* 7. Daily Operations */}
          <Card title="7. Daily Operations (Simplified Flow)" icon={BookOpen} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center gap-2">
              {["Patient registration", "Phlebotomy", "QC check", "Pathologist validation", "Report delivery"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold">
                    {i + 1}. {step}
                  </div>
                  {i < 4 && <ArrowRight size={18} className="text-slate-300 shrink-0" />}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "comprehensive" && (
        <div className="space-y-3">
          {[
            {
              id: "1",
              title: "Regulatory Framework & Legal Compliance",
              content: (
                <div className="space-y-4 text-sm text-slate-600 pt-4">
                  <div>
                    <p className="font-bold text-slate-800">Clinical Establishments Act (CEA) 2010</p>
                    <p className="mt-1 leading-relaxed">Uttar Pradesh has adopted CEA. All diagnostic labs in Noida must register. District Registering Authority: CMO, Gautam Buddh Nagar. Apply within 3 months of commencing operations.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Noida-Specific</p>
                    <p className="mt-1 leading-relaxed">District: Gautam Buddh Nagar. Noida Authority & Noida Development Authority have building and commercial establishment regulations.</p>
                  </div>
                </div>
              ),
            },
            {
              id: "2",
              title: "Licenses & Registrations Required",
              content: (
                <div className="space-y-4 text-sm text-slate-600 pt-4">
                  {[
                    { h: "Clinical Establishment Registration", d: "CMO Gautam Buddh Nagar. Processing: 60-90 days." },
                    { h: "Shop and Establishment Act", d: "UP Labour / Nivesh Mitra. Processing: 15-30 days. Validity: 5 years." },
                    { h: "Fire Safety NOC", d: "Nivesh Mitra. Processing: 15-30 days. Validity: 1 year." },
                    { h: "BMW Authorization", d: "UPPCB. CBWTF contract first. Processing: 60-90 days." },
                    { h: "GST, PAN, TAN, Professional Tax", d: "Mandatory for diagnostic services." },
                  ].map(({ h, d }) => (
                    <div key={h}>
                      <p className="font-bold text-slate-800">{h}</p>
                      <p className="mt-0.5 leading-relaxed">{d}</p>
                    </div>
                  ))}
                </div>
              ),
            },
            {
              id: "3",
              title: "Infrastructure Requirements",
              content: (
                <div className="space-y-3 text-sm text-slate-600 pt-4">
                  <p><strong className="text-slate-800">Minimum Space:</strong> 200-250 sq ft</p>
                  <p><strong className="text-slate-800">Zones:</strong> Reception, Phlebotomy, Sample Processing, Reporting & QC (80-100 sq ft), BMW Storage (40-50 sq ft), Utilities, Washrooms</p>
                  <p><strong className="text-slate-800">Technical:</strong> 220-240V, UPS (2hr), AC 20-25°C, RO water, fire extinguishers, CCTV, LIMS</p>
                </div>
              ),
            },
            {
              id: "4",
              title: "Staffing & Personnel",
              content: (
                <div className="space-y-3 text-sm text-slate-600 pt-4">
                  <p><strong className="text-slate-800">Mandatory:</strong> Pathologist (MD/DNB/DCP), 2-3 MLTs (DMLT/BMLT), 1 Lab Attendant</p>
                  <p><strong className="text-slate-800">Recommended:</strong> Receptionist, Data Entry Operator</p>
                  <p><strong className="text-slate-800">Training:</strong> BMW, Infection Control, Fire Safety. Hepatitis-B vaccination mandatory.</p>
                </div>
              ),
            },
            {
              id: "5",
              title: "NABL Accreditation",
              content: (
                <div className="space-y-3 text-sm text-slate-600 pt-4">
                  <p>Standard: ISO 15189:2022. Validity: 4 years. Apply typically Month 18-24 after operations.</p>
                  <p><strong className="text-slate-800">Pre-requisites:</strong> QMS, PT participation, SOPs, IQC, method validation.</p>
                </div>
              ),
            },
            {
              id: "6",
              title: "Biomedical Waste Management",
              content: (
                <div className="space-y-3 text-sm text-slate-600 pt-4">
                  <p><strong className="text-slate-800">Color coding:</strong> Yellow (infectious), Red (contaminated plastic), White (sharps), Blue (glassware)</p>
                  <p>CBWTF contract mandatory. Annual report to UPPCB by 30 June. Staff PPE and training required.</p>
                </div>
              ),
            },
          ].map(({ id, title, content }) => (
            <div
              key={id}
              className={`rounded-xl border overflow-hidden bg-white transition-all ${
                openSection === id ? "border-blue-200 shadow-md" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <button
                onClick={() => toggleSection(id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-4">
                  <span className="w-10 h-10 rounded-xl bg-slate-900 text-white text-sm font-black flex items-center justify-center shrink-0">
                    {id}
                  </span>
                  <span className="font-bold text-slate-800 group-hover:text-slate-900">{title}</span>
                </div>
                <div
                  className={`p-2 rounded-lg transition-all ${
                    openSection === id ? "bg-blue-50 text-blue-600 rotate-180" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <ChevronDown size={20} />
                </div>
              </button>
              {openSection === id && (
                <div className="px-6 pb-6 border-t border-slate-100">
                  {content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
