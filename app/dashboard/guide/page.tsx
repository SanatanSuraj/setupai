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
  Info,
} from "lucide-react";

type Tab = "quick" | "comprehensive";

export default function GuidePage() {
  const [tab, setTab] = useState<Tab>("quick");
  const [openSection, setOpenSection] = useState<string | null>("1");

  const toggleSection = (id: string) =>
    setOpenSection((s) => (s === id ? null : id));

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-5xl mx-auto">

      {/* Page Header */}
      <div className="flex items-start gap-3 pb-6 border-b border-gray-100">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50">
          <BookOpen size={17} className="text-sky-600" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Setup Guide</h1>
            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold text-gray-500">
              India — All States &amp; UTs
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            A complete regulatory, infrastructure &amp; operational guide for diagnostic labs.
          </p>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <Info size={11} className="text-blue-400 shrink-0" />
            Licensing authorities vary by state. Verify with your District CMO.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setTab("quick")}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-150 ${
            tab === "quick"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Quick Guide
        </button>
        <button
          onClick={() => setTab("comprehensive")}
          className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-150 ${
            tab === "comprehensive"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Comprehensive Guide
        </button>
      </div>

      {tab === "quick" && (
        <div className="space-y-8">

          {/* 1. Services */}
          <Card title="1. Typical Clinical Diagnostic Laboratory Offering" icon={Building2} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Haematology — CBC (22 parameters)",
                "Biochemistry — Lipid, Liver, Kidney, Glucose profiles",
                "Diabetes management — HbA1c, Fasting & PP glucose",
                "Immunoassay — Thyroid (TSH/T3/T4), Hormones",
                "Microbiology — Culture, Sensitivity, Serology",
                "Histopathology / Cytology (advanced labs)",
              ].map((item, i) => (
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
            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium flex gap-2">
              <Info size={14} className="shrink-0 mt-0.5" />
              Licensing authorities differ by state. The list below covers central/common requirements applicable across India.
            </div>
            <div className="space-y-3">
              {[
                { title: "Clinical Establishment Registration (CEA, 2010)", auth: "District CMO / State Health Department", desc: "Most states have adopted CEA. Some states have their own equivalent act." },
                { title: "Shop & Establishment Registration", auth: "State Labour Department / State Portal", desc: "Typically processed within 15–30 days. Validity varies by state." },
                { title: "Biomedical Waste (BMW) Authorization — BMW Rules 2016", auth: "State Pollution Control Board (SPCB/CPCB)", desc: "CBWTF contract must be in place before applying. Processing: 60–90 days." },
                { title: "Fire Safety NOC", auth: "State Fire Department / State Clearance Portal", desc: "Annual renewal required in most states." },
                { title: "Business & Tax Registrations", auth: "GST: GSTN portal  |  PAN & TAN: Income Tax Dept.", desc: "Company incorporation via MCA portal. Professional tax registration as applicable in your state." },
                { title: "Drugs License (if dispensing drugs)", auth: "State Drug Control Authority", desc: "Required only if the lab dispenses diagnostic reagents or medicines to patients." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-100 hover:shadow-sm transition-all group">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900 text-white text-sm font-black flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{item.title}</p>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">Authority: {item.auth}</p>
                    {item.desc && <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 3. Space & Infrastructure */}
          <Card title="3. Space & Infrastructure" icon={MapPin} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              {[
                { label: "Basic Lab", area: "200–300 sq ft", note: "Collection + processing" },
                { label: "Medium Lab", area: "400–600 sq ft", note: "Full diagnostics" },
                { label: "Advanced Lab", area: "800+ sq ft", note: "Histopath + micro" },
              ].map(({ label, area, note }) => (
                <div key={label} className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{area}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{note}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Mandatory Zones</p>
                <div className="space-y-2">
                  {[
                    "Reception & Patient Waiting Area",
                    "Phlebotomy Room (with privacy partition)",
                    "Sample Processing & Analytical Lab",
                    "Sample Storage / Cold Chain Area",
                    "BMW Storage (lockable, separate entry)",
                    "Staff Room / Washrooms",
                    "Reporting & Documentation Area",
                  ].map((z) => (
                    <p key={z} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      {z}
                    </p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Core Infrastructure</p>
                <div className="space-y-2">
                  {[
                    "Stable power supply + UPS/Inverter backup",
                    "Air conditioning 20–25°C",
                    "RO water supply / DI water for reagents",
                    "Fire extinguishers, PPE kits, spill kits",
                    "CCTV surveillance",
                    "LIMS / LIS software integration",
                    "Broadband internet for report delivery",
                  ].map((i) => (
                    <p key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {i}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Staffing */}
          <Card title="4. Minimum Staffing Required (as per CEA / NABL)" icon={Users} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-3">Mandatory</p>
                <div className="space-y-2">
                  {[
                    "Pathologist — MD / DNB / DCP (full-time or visiting)",
                    "Medical Lab Technicians — DMLT / BMLT (min. 2)",
                    "Lab Attendant / Helper (min. 1)",
                  ].map((r) => (
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
                  {["Receptionist / Front-desk executive", "Data entry / LIMS operator", "Phlebotomist (NACP-certified preferred)"].map((r) => (
                    <p key={r} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      {r}
                    </p>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs font-bold text-amber-800">
                    ✔ Hepatitis-B vaccination mandatory for all lab staff
                  </p>
                  <p className="text-xs text-amber-700 mt-1">BMW handling, infection control &amp; fire safety training required</p>
                </div>
              </div>
            </div>
          </Card>

          {/* 5. Equipment */}
          <Card title="5. Equipment — Keep It Lean at Launch" icon={Zap} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Haematology Analyzer (5-part CBC)",
                "Semi-auto / Full-auto Biochemistry Analyzer",
                "Refrigerator 2–8°C + Deep Freezer −20°C",
                "Centrifuge (micro & macro)",
                "Phlebotomy chairs + needle destroyer",
                "Barcode printer + handheld scanner",
                "Computers + LIMS / LIS software",
                "Microscope (binocular)",
                "Incubator / Biosafety Cabinet (if micro)",
              ].map((e) => (
                <div key={e} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors">
                  <Zap size={16} className="text-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">{e}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 6. BMW */}
          <Card title="6. Biomedical Waste Management (BMW Rules, 2016)" icon={Trash2} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap gap-4 mb-5">
              {[
                { color: "Yellow", bg: "bg-yellow-400", label: "Infectious / anatomical" },
                { color: "Red", bg: "bg-red-500", label: "Contaminated plastic" },
                { color: "White", bg: "bg-slate-200 border border-slate-300", label: "Sharps / needles" },
                { color: "Blue", bg: "bg-blue-500", label: "Glassware / metallic" },
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
              {[
                "Daily segregation at source — no mixing of categories",
                "Signed contract with CPCB-authorized CBWTF operator",
                "Maintain BMW registers (Form 2) + bar-coded tracking",
                "Annual return to State Pollution Control Board by 30 June",
                "Staff PPE — gloves, masks, aprons + spill management kit",
                "Display BMW color-coding chart prominently in the lab",
              ].map((b) => (
                <p key={b} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  {b}
                </p>
              ))}
            </div>
          </Card>

          {/* 7. Daily Operations */}
          <Card title="7. Standard Daily Operations Flow" icon={BookOpen} className="border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center gap-2">
              {["Patient registration & consent", "Phlebotomy / sample collection", "Sample processing & analysis", "Pathologist validation", "Report generation & delivery"].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold whitespace-nowrap">
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
                    <p className="font-bold text-slate-800">Clinical Establishments Act (CEA), 2010</p>
                    <p className="mt-1 leading-relaxed">The CEA is a central act adopted by most states and all UTs. It mandates registration of all clinical establishments including diagnostic labs. The registering authority is typically the Chief Medical Officer (CMO) or District Health Officer of the respective district. Apply for provisional registration within 6 months of commencing operations and seek permanent registration thereafter.</p>
                    <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 font-medium">Note: Some states (e.g. Tamil Nadu, Maharashtra, Delhi) have their own Clinical Establishment acts or rules in addition to CEA. Always verify at the state level.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">State-Specific Portals</p>
                    <p className="mt-1 leading-relaxed">Most states have single-window clearance portals (e.g. Nivesh Mitra — UP, Udyog Mitra — Rajasthan, Aaple Sarkar — Maharashtra, eBiz — central). Use your state&apos;s portal for Shop &amp; Establishment, Fire NOC, and related registrations.</p>
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
                    { h: "Clinical Establishment Registration", d: "Authority: CMO / District Health Officer. Processing: 30–90 days (varies by state). Renewal: every 1–5 years as per state rules." },
                    { h: "Shop and Establishment Act Registration", d: "Authority: State Labour Department. Most states have online portals. Processing: 7–30 days. Validity: 1–5 years." },
                    { h: "Fire Safety NOC", d: "Authority: State Fire Department or designated portal. Typically renewed annually. Required before commencing operations in most states." },
                    { h: "Biomedical Waste (BMW) Authorization", d: "Authority: State Pollution Control Board (SPCB). Secure CBWTF contract first. Processing: 60–90 days. Annual renewal required." },
                    { h: "GST, PAN & TAN Registration", d: "GST via GSTN portal. PAN & TAN via Income Tax e-filing portal. Diagnostic services are exempt from GST for patients but labs pay GST on inputs." },
                    { h: "Professional Tax (where applicable)", d: "Applicable in Maharashtra, Karnataka, West Bengal, Andhra Pradesh, Telangana, Gujarat, and a few other states. Register with State Commercial Tax Dept." },
                    { h: "Drug License (if applicable)", d: "Required if the lab dispenses drugs or diagnostic kits directly to patients. Authority: State Drug Controller." },
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
                  <p><strong className="text-slate-800">Minimum Area:</strong> 200–250 sq ft for a basic collection &amp; processing lab; 400–600 sq ft for a full-service mid-size lab; 800+ sq ft for advanced labs with histopathology.</p>
                  <p><strong className="text-slate-800">Mandatory Zones:</strong> Reception, Phlebotomy Room (privacy required), Sample Processing, Analytical Area, Reporting &amp; Documentation, BMW Storage (separate lockable area), Staff Washroom, Patient Washroom.</p>
                  <p><strong className="text-slate-800">Electrical:</strong> 220–240V stable supply; UPS / generator backup (minimum 2 hrs); 10–15 KW sanctioned load for a mid-size lab with analyzers.</p>
                  <p><strong className="text-slate-800">Environment:</strong> Air-conditioning maintained at 20–25°C; RO or deionised water supply for reagent preparation; Cold chain 2–8°C for reagents and samples.</p>
                  <p><strong className="text-slate-800">Safety:</strong> ABC-type fire extinguishers, eyewash stations, PPE dispenser, biological spill kit, first-aid box, CCTV coverage.</p>
                </div>
              ),
            },
            {
              id: "4",
              title: "Staffing & Personnel Requirements",
              content: (
                <div className="space-y-3 text-sm text-slate-600 pt-4">
                  <p><strong className="text-slate-800">Mandatory (CEA / NABL):</strong> Qualified Pathologist (MD / DNB / DCP) — full-time or designated visiting; minimum 2 Medical Lab Technicians (DMLT / BMLT); 1 Lab Attendant.</p>
                  <p><strong className="text-slate-800">Recommended:</strong> Receptionist, Data Entry Operator / LIMS Operator, NACP-certified Phlebotomist.</p>
                  <p><strong className="text-slate-800">Mandatory Training:</strong> BMW handling (CPCB curriculum), Infection control, Fire safety drill, POSH (if 10+ employees).</p>
                  <p><strong className="text-slate-800">Health Requirements:</strong> Hepatitis-B vaccination (3-dose series) mandatory for all lab staff. Annual health check recommended.</p>
                  <p><strong className="text-slate-800">Documentation:</strong> Staff appointment letters, qualification certificates, registration with State Medical Council / State Paramedical Council as applicable.</p>
                </div>
              ),
            },
            {
              id: "5",
              title: "NABL Accreditation (ISO 15189:2022)",
              content: (
                <div className="space-y-3 text-sm text-slate-600 pt-4">
                  <p><strong className="text-slate-800">Standard:</strong> ISO 15189:2022 — Medical Laboratories. Accreditation body: NABL (National Accreditation Board for Testing and Calibration Laboratories), under QCI, Government of India.</p>
                  <p><strong className="text-slate-800">Validity:</strong> 4 years from date of accreditation with annual surveillance assessments.</p>
                  <p><strong className="text-slate-800">When to Apply:</strong> Typically after 12–24 months of stable operations with documented IQC data and completed PT cycles.</p>
                  <p><strong className="text-slate-800">Prerequisites:</strong> Documented Quality Management System (QMS), validated test methods for each scope item, participation in External Quality Assurance Scheme (EQAS / PT), Internal Audit completed, Management Review conducted.</p>
                  <p><strong className="text-slate-800">Fees:</strong> ₹30,000–₹1,00,000 depending on number of tests in accreditation scope. Apply at nabl-india.org.</p>
                </div>
              ),
            },
            {
              id: "6",
              title: "Biomedical Waste (BMW) Management",
              content: (
                <div className="space-y-3 text-sm text-slate-600 pt-4">
                  <p><strong className="text-slate-800">Governing Act:</strong> Bio-Medical Waste Management Rules, 2016 (amended 2018 &amp; 2019) — Ministry of Environment, Forest and Climate Change, Government of India.</p>
                  <p><strong className="text-slate-800">Colour Coding:</strong> Yellow — human anatomical, infectious, highly infectious, soiled waste; Red — contaminated recyclable plastic; White — sharps, needles; Blue — glassware, metallic body implants.</p>
                  <p><strong className="text-slate-800">Mandatory Requirements:</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
                    <li>Signed contract with CPCB-authorized Common Biomedical Waste Treatment Facility (CBWTF) operator</li>
                    <li>BMW registers in Form 2; bar-coded bag tracking</li>
                    <li>Pre-treatment of microbiological waste before disposal</li>
                    <li>Annual return to State Pollution Control Board by 30 June each year</li>
                    <li>Display BMW color-coding chart in Hindi / local language + English</li>
                    <li>Staff PPE — gloves, masks, lab coat, shoe covers; spill management kit</li>
                  </ul>
                  <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 font-medium mt-2">CBWTF pickup frequency must be at least once every 2 days. Non-compliance attracts penalties under Environment Protection Act, 1986.</p>
                </div>
              ),
            },
            {
              id: "7",
              title: "PC-PNDT Act Compliance (Ultrasound / Genetic Labs)",
              content: (
                <div className="space-y-3 text-sm text-slate-600 pt-4">
                  <p><strong className="text-slate-800">Applicable to:</strong> Labs performing ultrasound, genetic testing, sex selection-related procedures.</p>
                  <p><strong className="text-slate-800">Governing Act:</strong> Pre-Conception and Pre-Natal Diagnostic Techniques (Prohibition of Sex Selection) Act, 1994 — amended 2003.</p>
                  <p><strong className="text-slate-800">Registration Authority:</strong> Appropriate Authority designated by the State Government at district level.</p>
                  <p><strong className="text-slate-800">Key Requirements:</strong> Form A / Form B registration, maintenance of Form F records for every patient, quarterly reports to Appropriate Authority, display of anti-sex-selection notices.</p>
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 font-medium">Non-compliance is a criminal offence with imprisonment up to 3 years and fines up to ₹10,000 for first offence.</p>
                </div>
              ),
            },
          ].map(({ id, title, content }) => (
            <div
              key={id}
              className={`rounded-xl border overflow-hidden bg-white transition-all ${
                openSection === id
                  ? "border-blue-200 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
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
                    openSection === id
                      ? "bg-blue-50 text-blue-600 rotate-180"
                      : "bg-slate-100 text-slate-500"
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
