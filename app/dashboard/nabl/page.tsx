"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import {
  FileText, CheckCircle, AlertTriangle, Clock, BookOpen, Target,
  Award, Calendar, TrendingUp, AlertCircle, Plus, Pencil, Save,
  X, Trash2, ChevronDown, ChevronRight,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
type SectionStatus = "completed" | "in_progress" | "pending";
type PTStatus = "enrolled" | "completed" | "pending" | "overdue";
type AuditStatus = "scheduled" | "completed" | "pending";
type NablPhase = "preparation" | "application" | "assessment" | "accredited";
type Tab = "overview" | "documents" | "tests" | "timeline";

interface QualitySection { name: string; status: SectionStatus; lastUpdated?: string; }
interface ProficiencyTest { testName: string; provider: string; dueDate: string; status: PTStatus; score?: number; }
interface AuditEntry { type: string; date: string; auditor: string; status: AuditStatus; }
interface NablReqCategory { category: string; completed: number; total: number; }
interface DocumentControl { totalDocuments: number; controlledDocuments: number; pendingReview: number; overdueDocs: number; }

// ─── Document Checklist Data ────────────────────────────────────────────────────
const DOCUMENT_SECTIONS = [
  {
    id: "A", title: "NABL Application Documents",
    items: [
      "Application form completed on NABL portal (nabl-india.org)",
      "Certificate of incorporation / Partnership deed",
      "GST registration certificate",
      "PAN Card of entity",
      "Board resolution appointing authorized signatory",
      "ID proof of authorized signatory",
      "Specimen signature of authorized person",
      "Application fee payment receipt (₹30,000–1,00,000 based on scope)",
      "Scope of accreditation – list of all tests",
      "Test methods/procedures for each accredited test",
      "Equipment list per test",
    ],
  },
  {
    id: "B", title: "Quality Management System (QMS) Documents",
    items: [
      "Quality Manual – laboratory organization structure",
      "Quality Manual – scope of accreditation",
      "Quality Manual – quality policy and objectives",
      "Quality Manual – management responsibilities",
      "Quality Manual – document control procedures",
      "Quality Manual – examination processes",
      "Quality Manual – quality assurance & continual improvement",
      "Quality Manual – corrective and preventive actions (CAPA)",
      "Quality Manual – management review & records control",
      "SOP: Patient identification & test request handling",
      "SOP: Sample collection (each sample type)",
      "SOP: Sample labeling, transportation, receipt & storage",
      "SOP: Sample rejection criteria",
      "SOP: Testing procedure for each test (detailed)",
      "SOP: Equipment operation and calibration",
      "SOP: Internal quality control (IQC) procedures",
      "SOP: Validation/verification of methods",
      "SOP: Measurement uncertainty estimation",
      "SOP: Result verification, validation, and reporting",
      "SOP: Critical value reporting",
      "SOP: Document control and records management",
      "SOP: Training and competency assessment",
      "SOP: Complaints handling and incident management",
      "SOP: Non-conformity, corrective & preventive actions",
      "SOP: Internal audit and management review",
      "Work instructions – step-by-step for each test",
      "Work instructions – equipment operating instructions",
      "Work instructions – safety & emergency procedures",
    ],
  },
  {
    id: "C", title: "Personnel Qualification & Competency",
    items: [
      "Organization chart",
      "Job descriptions – Laboratory Director/Head",
      "Job descriptions – Quality Manager",
      "Job descriptions – Technical Manager",
      "Job descriptions – Technologists and phlebotomists",
      "Responsibility and authority matrix",
      "Pathologist: Qualification certificates (attested)",
      "Pathologist: Medical registration certificate (UPMC)",
      "Pathologist: Experience certificates",
      "Pathologist: ISO 15189 training records",
      "Pathologist: Competency assessment records",
      "Pathologist: CPD (Continuing Professional Development) records",
      "Quality Manager: Science graduate qualification",
      "Quality Manager: ISO 15189 training certificate",
      "Quality Manager: Internal auditor training certificate",
      "Quality Manager: Appointment letter and authorization",
      "Each technician: Educational qualification (attested)",
      "Each technician: Training certificates (internal & external)",
      "Each technician: Initial and ongoing competency assessments (annual)",
      "Each technician: Authorization for specific tests",
      "Annual training plan and attendance records",
      "Training effectiveness evaluation records",
      "Retraining and revalidation records",
    ],
  },
  {
    id: "D", title: "Equipment & Calibration",
    items: [
      "Equipment specification sheets for all instruments",
      "User manuals for all instruments",
      "Purchase orders and invoices",
      "Installation certificates and commissioning reports",
      "Performance verification documents",
      "Calibration certificates from NABL accredited labs (pipettes, balances, thermometers, pH meters, centrifuges, incubators, refrigerators, timers)",
      "Calibration schedule (6-monthly / annual)",
      "Ongoing calibration records register",
      "Traceability chain documents to national/international standards",
      "Reference materials certificates (CRM/SRM)",
      "Measurement uncertainty calculations",
      "Preventive maintenance records and schedule",
      "Equipment breakdown and repair records",
      "Equipment usage logs",
      "AMC (Annual Maintenance Contract) documents",
      "Certificates of analysis for reference materials",
      "Reagent lot acceptance testing records",
      "Storage condition monitoring and expiry tracking records",
    ],
  },
  {
    id: "E", title: "Quality Control & Quality Assurance",
    items: [
      "IQC plan for each test",
      "Control materials selection justification",
      "Acceptable range determination documents",
      "Daily IQC records",
      "Levey-Jennings charts for all tests",
      "Westgard rules documentation and application",
      "Out-of-control investigation records",
      "EQAS enrollment certificates (CMC Vellore, AIIMS, Bio-Rad, Randox, CAP)",
      "EQAS participation records and result reports",
      "Unacceptable EQAS performance investigation and corrective actions",
      "Method validation: accuracy, precision, linearity for each test",
      "LOD and LOQ studies for applicable tests",
      "Interference and comparison studies",
      "Biological reference intervals validation",
      "Measurement uncertainty calculations per test",
    ],
  },
  {
    id: "F", title: "Facility & Infrastructure",
    items: [
      "Detailed floor plan (scale drawing) with all zones labeled",
      "Workflow design documentation (unidirectional flow)",
      "Room temperature monitoring logs (daily)",
      "Refrigerator temperature logs (daily)",
      "Freezer temperature logs (daily)",
      "Incubator temperature monitoring logs",
      "Humidity monitoring logs (if applicable)",
      "Ventilation system – air changes per hour documentation",
      "Biosafety cabinet certification (if applicable)",
      "Biosafety level classification document",
      "Material Safety Data Sheets (MSDS) for all chemicals",
      "Chemical inventory and storage plan",
      "PPE policy and usage records",
      "Eye wash station and spill kit inspection records",
      "Water quality testing reports (distilled/deionized)",
    ],
  },
  {
    id: "G", title: "Information Management (LIS)",
    items: [
      "LIS software documentation and validation certificate",
      "User access control matrix",
      "Data backup procedures and disaster recovery plan",
      "Software update and upgrade records",
      "Audit trail functionality documentation",
      "Data entry and verification procedures",
      "Result approval workflow documentation",
      "Result retention policy (minimum 2 years)",
      "Electronic signature policy",
      "Data archiving and retrieval procedures",
    ],
  },
  {
    id: "H", title: "Internal Audits & Management Review",
    items: [
      "Annual internal audit plan",
      "Internal auditor qualifications (ISO 15189 training certificates)",
      "Audit checklists based on ISO 15189:2022",
      "Completed audit reports",
      "Non-conformity reports (NCR)",
      "Corrective action records and follow-up",
      "Management review schedule (minimum annual)",
      "Management review agenda and minutes",
      "Management review action items and follow-up",
      "Review records: quality indicators, complaints, EQAS performance",
    ],
  },
  {
    id: "I", title: "Complaint & Feedback Management",
    items: [
      "Patient feedback form and collection procedure",
      "Feedback analysis and trends records",
      "Complaint register",
      "Complaint handling procedure",
      "Root cause analysis format",
      "Corrective action and resolution records",
      "Complainant communication records",
    ],
  },
  {
    id: "J", title: "Pre-Assessment Preparation",
    items: [
      "Complete quality manual (reviewed and approved)",
      "All SOPs (reviewed, approved, current)",
      "All forms and formats complete",
      "Complete equipment files for all instruments",
      "Complete personnel files for all staff",
      "6 months IQC records",
      "6 months EQAS participation records",
      "6 months equipment maintenance records",
      "6 months calibration records",
      "6 months temperature logs",
      "6 months training records",
      "6 months audit records",
      "Internal mock assessment completed",
      "Mock non-conformities identified and closed",
    ],
  },
  {
    id: "K", title: "NABL Assessment Documents",
    items: [
      "Assessment fee payment (₹50,000–2,00,000 based on scope)",
      "Confirmation of assessment dates",
      "Assessment schedule coordination with NABL",
      "All documents available for assessor review",
      "Staff available for interviews during assessment",
      "Test procedure demonstrations prepared",
      "NCR (Non-Conformity Reports) from assessors",
      "Root cause analysis for each NCR",
      "Corrective action plan and implementation evidence",
      "Submission of corrective actions to NABL",
    ],
  },
  {
    id: "L", title: "Ongoing NABL Compliance (Post-Accreditation)",
    items: [
      "Annual surveillance assessment preparation",
      "Continued EQAS participation (all enrolled programs)",
      "Annual management review conducted",
      "Annual internal audits conducted",
      "Re-assessment preparation (every 4 years)",
      "Scope extension application (for new tests)",
      "Method validation for new tests added",
      "Change notification to NABL (location, personnel, equipment, legal entity)",
    ],
  },
  {
    id: "M", title: "Quality Indicators & Monitoring",
    items: [
      "Quality indicators defined for pre-analytical errors",
      "Quality indicators defined for analytical errors",
      "Quality indicators defined for post-analytical errors",
      "TAT (Turnaround Time) compliance monitoring",
      "Sample rejection rate tracking",
      "Critical value reporting time monitoring",
      "Customer satisfaction and complaint rate records",
      "EQAS performance indicator records",
      "Monthly quality indicator reports",
      "Trend analysis and benchmarking data",
      "Improvement action plans based on indicators",
    ],
  },
];

const TIMELINE_PHASES = [
  {
    phase: "Preparation Phase", duration: "6–9 months", color: "blue",
    activities: ["QMS development", "Staff training", "SOP writing", "Equipment calibration", "Mock audits"],
  },
  {
    phase: "Operational Phase", duration: "3–6 months", color: "violet",
    activities: ["Generate operational records", "IQC implementation", "EQAS participation", "Internal audits", "Management review"],
  },
  {
    phase: "Application Phase", duration: "1–2 months", color: "amber",
    activities: ["NABL application submission", "Document submission", "Pre-assessment review"],
  },
  {
    phase: "Assessment Phase", duration: "1–2 months", color: "orange",
    activities: ["NABL assessment visit", "NCR closure", "Re-verification"],
  },
  {
    phase: "Accreditation", duration: "~1 month", color: "emerald",
    activities: ["Certificate issuance", "NABL logo usage rights", "Publish accredited scope"],
  },
];

// ─── Static defaults ────────────────────────────────────────────────────────────
const DEFAULT_SECTIONS: QualitySection[] = [
  { name: "Quality Policy & Objectives", status: "pending" },
  { name: "Document Control", status: "pending" },
  { name: "Management Responsibility", status: "pending" },
  { name: "Resource Management", status: "pending" },
  { name: "Pre-examination Processes", status: "pending" },
  { name: "Examination Processes", status: "pending" },
  { name: "Post-examination Processes", status: "pending" },
  { name: "Management System Improvement", status: "pending" },
];
const DEFAULT_PT: ProficiencyTest[] = [];
const DEFAULT_AUDITS: AuditEntry[] = [];
const DEFAULT_REQUIREMENTS: NablReqCategory[] = [
  { category: "General Requirements", completed: 0, total: 10 },
  { category: "Structural Requirements", completed: 0, total: 8 },
  { category: "Resource Requirements", completed: 0, total: 15 },
  { category: "Process Requirements", completed: 0, total: 25 },
  { category: "Management System", completed: 0, total: 12 },
  { category: "Improvement Requirements", completed: 0, total: 6 },
];

const SECTION_STATUS_OPTIONS: SectionStatus[] = ["pending", "in_progress", "completed"];
const PT_STATUS_OPTIONS: PTStatus[] = ["pending", "enrolled", "completed", "overdue"];
const AUDIT_STATUS_OPTIONS: AuditStatus[] = ["pending", "scheduled", "completed"];

const badgeVariant: Record<string, "success" | "warning" | "info" | "danger" | "slate"> = {
  completed: "success", in_progress: "warning", pending: "slate",
  enrolled: "info", overdue: "danger", scheduled: "info",
};

const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none";

// ─── Component ──────────────────────────────────────────────────────────────────
export default function NABLPage() {
  const [tab, setTab] = useState<Tab>("overview");

  // editable state
  const [sections, setSections] = useState<QualitySection[]>(DEFAULT_SECTIONS);
  const [proficiencyTests, setProficiencyTests] = useState<ProficiencyTest[]>(DEFAULT_PT);
  const [audits, setAudits] = useState<AuditEntry[]>(DEFAULT_AUDITS);
  const [requirements, setRequirements] = useState<NablReqCategory[]>(DEFAULT_REQUIREMENTS);
  const [docControl, setDocControl] = useState<DocumentControl>({ totalDocuments: 0, controlledDocuments: 0, pendingReview: 0, overdueDocs: 0 });

  // doc checklist
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // section editing
  const [editingSectionIdx, setEditingSectionIdx] = useState<number | null>(null);
  const [sectionDraft, setSectionDraft] = useState<QualitySection | null>(null);

  // PT
  const [editingPTIdx, setEditingPTIdx] = useState<number | null>(null);
  const [showAddPT, setShowAddPT] = useState(false);
  const [ptDraft, setPtDraft] = useState<Partial<ProficiencyTest>>({});

  // Audit
  const [editingAuditIdx, setEditingAuditIdx] = useState<number | null>(null);
  const [showAddAudit, setShowAddAudit] = useState(false);
  const [auditDraft, setAuditDraft] = useState<Partial<AuditEntry>>({});

  // Doc control
  const [editingDocControl, setEditingDocControl] = useState(false);
  const [docDraft, setDocDraft] = useState<DocumentControl>(docControl);

  // Req editing
  const [editingReqIdx, setEditingReqIdx] = useState<number | null>(null);
  const [reqDraft, setReqDraft] = useState<Partial<NablReqCategory>>({});

  // load
  useEffect(() => {
    fetch("/api/nabl/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data.qualityManual?.sections) && data.qualityManual.sections.length > 0)
          setSections(data.qualityManual.sections);
        if (Array.isArray(data.proficiencyTests))
          setProficiencyTests(data.proficiencyTests);
        if (Array.isArray(data.auditSchedule))
          setAudits(data.auditSchedule);
        if (Array.isArray(data.nablRequirements) && data.nablRequirements.length > 0)
          setRequirements(data.nablRequirements);
        if (data.documentControl)
          setDocControl(data.documentControl);
      })
      .catch(() => {});

    const saved = localStorage.getItem("nabl_checklist");
    if (saved) setCheckedItems(JSON.parse(saved));
  }, []);

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("nabl_checklist", JSON.stringify(next));
      return next;
    });
  };

  const toggleOpenSection = (id: string) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const postAction = useCallback(async (action: string, data: Record<string, unknown>) => {
    setSaving(true); setError(null);
    const res = await fetch("/api/nabl/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError((d?.error as string) || "Failed to save changes.");
      return false;
    }
    return true;
  }, []);

  const readinessScore = Math.round(
    (sections.filter((s) => s.status === "completed").length / sections.length) * 100
  );
  const phase: NablPhase = readinessScore < 40 ? "preparation" : readinessScore < 70 ? "application" : readinessScore < 90 ? "assessment" : "accredited";
  const phaseColor = phase === "accredited" ? "success" : phase === "assessment" ? "info" : phase === "application" ? "warning" : "slate";

  const saveSection = async (idx: number) => {
    if (!sectionDraft) return;
    await postAction("update_quality_manual", { sectionName: sectionDraft.name, status: sectionDraft.status });
    setSections(sections.map((s, i) => (i === idx ? sectionDraft : s)));
    setEditingSectionIdx(null); setSectionDraft(null);
  };

  const savePT = async () => {
    if (!ptDraft.testName || !ptDraft.provider || !ptDraft.dueDate) { setError("Fill in Test Name, Provider, and Due Date."); return; }
    const entry: ProficiencyTest = { testName: ptDraft.testName!, provider: ptDraft.provider!, dueDate: ptDraft.dueDate!, status: (ptDraft.status as PTStatus) ?? "pending", score: ptDraft.score ? Number(ptDraft.score) : undefined };
    await postAction("enroll_proficiency_test", entry as unknown as Record<string, unknown>);
    if (editingPTIdx !== null) { setProficiencyTests(proficiencyTests.map((p, i) => (i === editingPTIdx ? entry : p))); setEditingPTIdx(null); }
    else { setProficiencyTests((prev) => [...prev, entry]); setShowAddPT(false); }
    setPtDraft({});
  };

  const saveAudit = async () => {
    if (!auditDraft.type || !auditDraft.date || !auditDraft.auditor) { setError("Fill in Audit Type, Date, and Auditor."); return; }
    const entry: AuditEntry = { type: auditDraft.type!, date: auditDraft.date!, auditor: auditDraft.auditor!, status: (auditDraft.status as AuditStatus) ?? "pending" };
    await postAction("schedule_audit", { auditType: entry.type, date: entry.date, auditor: entry.auditor });
    if (editingAuditIdx !== null) { setAudits(audits.map((a, i) => (i === editingAuditIdx ? entry : a))); setEditingAuditIdx(null); }
    else { setAudits((prev) => [...prev, entry]); setShowAddAudit(false); }
    setAuditDraft({});
  };

  const avgScore = proficiencyTests.filter((p) => p.score != null).length > 0
    ? (proficiencyTests.reduce((s, p) => s + (p.score ?? 0), 0) / proficiencyTests.filter((p) => p.score != null).length).toFixed(1)
    : "—";

  // checklist stats per section
  const sectionStats = (id: string, items: string[]) => {
    const done = items.filter((_, i) => checkedItems[`${id}-${i}`]).length;
    return { done, total: items.length, pct: Math.round((done / items.length) * 100) };
  };
  const totalChecked = DOCUMENT_SECTIONS.reduce((acc, s) => acc + s.items.filter((_, i) => checkedItems[`${s.id}-${i}`]).length, 0);
  const totalItems = DOCUMENT_SECTIONS.reduce((acc, s) => acc + s.items.length, 0);

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview & Progress" },
    { id: "documents", label: `Document Checklist (${totalChecked}/${totalItems})` },
    { id: "tests", label: "Tests & Audits" },
    { id: "timeline", label: "NABL Timeline" },
  ];

  return (
    <div className="space-y-6 p-6 md:p-8">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 flex items-center justify-between">
          {error}<button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">NABL Accreditation</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">ISO 15189:2022 Medical Laboratories — all sections editable by lab owner</p>
        </div>
        <div className="flex gap-3">

        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 bg-slate-100 rounded-xl w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ───────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card title="NABL Readiness Score" icon={Target}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-blue-600">{readinessScore}%</span>
                  <Badge variant={phaseColor}>{phase.charAt(0).toUpperCase() + phase.slice(1)}</Badge>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${readinessScore}%` }} />
                </div>
                <div className="text-sm text-slate-500 space-y-1">
                  <p>Next: <span className="font-semibold text-slate-700">
                    {phase === "preparation" ? "Complete Quality Manual" : phase === "application" ? "Submit NABL Application" : phase === "assessment" ? "Assessment Visit" : "Maintain Accreditation"}
                  </span></p>
                  <p className="text-xs text-slate-400">{readinessScore}% of quality manual sections completed</p>
                </div>
              </div>
            </Card>

            <Card title="Quality Manual Progress" icon={BookOpen} className="lg:col-span-2">
              <div className="mb-4">
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-slate-600">Overall</span>
                  <span className="font-bold">{readinessScore}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${readinessScore}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sections.map((section, idx) => {
                  const isEditing = editingSectionIdx === idx;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-100">
                      <div className="flex items-center gap-2 min-w-0">
                        {section.status === "completed" && <CheckCircle size={14} className="text-emerald-500 shrink-0" />}
                        {section.status === "in_progress" && <Clock size={14} className="text-amber-500 shrink-0" />}
                        {section.status === "pending" && <AlertCircle size={14} className="text-slate-400 shrink-0" />}
                        {isEditing ? (
                          <input value={sectionDraft?.name ?? ""} onChange={(e) => setSectionDraft((d) => d ? { ...d, name: e.target.value } : d)} className="text-sm rounded border border-slate-200 px-2 py-0.5 w-full" />
                        ) : (
                          <span className="text-sm font-medium text-slate-700 truncate">{section.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isEditing ? (
                          <>
                            <select value={sectionDraft?.status} onChange={(e) => setSectionDraft((d) => d ? { ...d, status: e.target.value as SectionStatus } : d)} className="text-xs rounded border border-slate-200 px-1 py-0.5">
                              {SECTION_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                            </select>
                            <button onClick={() => saveSection(idx)} disabled={saving} className="text-blue-600 hover:text-blue-800"><Save size={13} /></button>
                            <button onClick={() => { setEditingSectionIdx(null); setSectionDraft(null); }} className="text-slate-400"><X size={13} /></button>
                          </>
                        ) : (
                          <>
                            <Badge variant={badgeVariant[section.status]}>{section.status.replace("_", " ")}</Badge>
                            <button onClick={() => { setEditingSectionIdx(idx); setSectionDraft({ ...section }); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 text-slate-500"><Pencil size={12} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Requirements Checklist */}
          <Card title="NABL ISO 15189:2022 Requirements" subtitle="Click the pencil to update completed count" icon={CheckCircle}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requirements.map((req, idx) => {
                const isEditing = editingReqIdx === idx;
                const pct = Math.round((req.completed / req.total) * 100);
                const color = pct >= 80 ? "emerald" : pct >= 60 ? "amber" : "rose";
                return (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl group hover:border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-800 text-sm">{req.category}</h3>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input type="number" value={reqDraft.completed ?? req.completed} min={0} max={req.total} onChange={(e) => setReqDraft((d) => ({ ...d, completed: Number(e.target.value) }))} className="w-12 rounded border border-slate-200 px-1.5 py-0.5 text-xs text-center" />
                          <span className="text-xs text-slate-400">/{req.total}</span>
                          <button onClick={() => { setRequirements(requirements.map((r, i) => i === idx ? { ...r, completed: Math.min(r.total, Math.max(0, Number(reqDraft.completed ?? r.completed))) } : r)); setEditingReqIdx(null); }} className="p-1 rounded bg-blue-600 text-white"><Save size={12} /></button>
                          <button onClick={() => setEditingReqIdx(null)} className="p-1 rounded border border-slate-200 text-slate-500"><X size={12} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Badge variant={color === "emerald" ? "success" : color === "amber" ? "warning" : "danger"}>{req.completed}/{req.total}</Badge>
                          <button onClick={() => { setEditingReqIdx(idx); setReqDraft({ completed: req.completed }); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-500"><Pencil size={12} /></button>
                        </div>
                      )}
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full bg-${color}-500 transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{pct}% complete</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* ── DOCUMENT CHECKLIST TAB ──────────────────────────────────────────── */}
      {tab === "documents" && (
        <div className="space-y-4">
          {/* Overall progress */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-slate-800">Overall Document Readiness</p>
                <p className="text-xs text-slate-500">{totalChecked} of {totalItems} documents completed</p>
              </div>
              <span className="text-2xl font-black text-blue-600">{Math.round((totalChecked / totalItems) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${(totalChecked / totalItems) * 100}%` }} />
            </div>
          </div>

          {DOCUMENT_SECTIONS.map((sec) => {
            const stats = sectionStats(sec.id, sec.items);
            const isOpen = openSections[sec.id] !== false; // default open
            const allDone = stats.done === stats.total;
            return (
              <div key={sec.id} className={`rounded-2xl border overflow-hidden ${allDone ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-white"}`}>
                <button
                  onClick={() => toggleOpenSection(sec.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-9 h-9 rounded-xl bg-slate-900 text-white text-sm font-black flex items-center justify-center shrink-0">{sec.id}</span>
                    <div>
                      <p className="font-bold text-slate-800">{sec.title}</p>
                      <p className="text-xs text-slate-500">{stats.done}/{stats.total} completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2">
                        <div className={`h-2 rounded-full ${allDone ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${stats.pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{stats.pct}%</span>
                    </div>
                    {allDone ? <CheckCircle size={18} className="text-emerald-500" /> : (isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />)}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 border-t border-slate-100">
                    <div className="space-y-1.5 mt-3">
                      {sec.items.map((item, i) => {
                        const key = `${sec.id}-${i}`;
                        const checked = !!checkedItems[key];
                        return (
                          <label key={i} className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors ${checked ? "bg-emerald-50/50" : ""}`}>
                            <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-emerald-500 border-emerald-500" : "border-slate-300 bg-white"}`} onClick={() => toggleCheck(key)}>
                              {checked && <CheckCircle size={12} className="text-white" />}
                            </div>
                            <span className={`text-sm ${checked ? "line-through text-slate-400" : "text-slate-700"}`}>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TESTS & AUDITS TAB ─────────────────────────────────────────────── */}
      {tab === "tests" && (
        <div className="space-y-6">
          {/* Proficiency Testing */}
          <Card title="Proficiency Testing & EQAS" subtitle="External Quality Assessment Scheme" icon={Award}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Completed", val: proficiencyTests.filter((p) => p.status === "completed").length, bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle },
                  { label: "Enrolled", val: proficiencyTests.filter((p) => p.status === "enrolled").length, bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
                  { label: "Pending", val: proficiencyTests.filter((p) => p.status === "pending").length, bg: "bg-amber-50", text: "text-amber-700", icon: AlertTriangle },
                  { label: "Avg Score", val: `${avgScore}%`, bg: "bg-slate-50", text: "text-slate-700", icon: TrendingUp },
                ].map(({ label, val, bg, text, icon: Icon }) => (
                  <div key={label} className={`${bg} p-4 rounded-xl flex items-center gap-3`}>
                    <Icon size={18} className={text} />
                    <div><p className={`font-black text-lg ${text}`}>{val}</p><p className="text-xs text-slate-500">{label}</p></div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {["Test Program", "Provider", "Due Date", "Status", "Score", ""].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {proficiencyTests.length === 0 && (
                      <tr><td colSpan={6} className="py-10 text-center text-slate-400 text-sm">No proficiency tests added yet. Click &ldquo;Add Proficiency Test&rdquo; below to get started.</td></tr>
                    )}
                    {proficiencyTests.map((test, idx) => {
                      const isEditing = editingPTIdx === idx;
                      return (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 group">
                          {isEditing ? (
                            <>
                              <td className="py-2 px-4"><input value={ptDraft.testName ?? ""} onChange={(e) => setPtDraft((d) => ({ ...d, testName: e.target.value }))} className={inputCls} /></td>
                              <td className="py-2 px-4"><input value={ptDraft.provider ?? ""} onChange={(e) => setPtDraft((d) => ({ ...d, provider: e.target.value }))} className={inputCls} /></td>
                              <td className="py-2 px-4"><input type="date" value={ptDraft.dueDate ?? ""} onChange={(e) => setPtDraft((d) => ({ ...d, dueDate: e.target.value }))} className={inputCls} /></td>
                              <td className="py-2 px-4"><select value={ptDraft.status ?? "pending"} onChange={(e) => setPtDraft((d) => ({ ...d, status: e.target.value as PTStatus }))} className={inputCls}>{PT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
                              <td className="py-2 px-4"><input type="number" value={ptDraft.score ?? ""} onChange={(e) => setPtDraft((d) => ({ ...d, score: Number(e.target.value) }))} className={inputCls} placeholder="Score %" /></td>
                              <td className="py-2 px-4"><div className="flex gap-1"><button onClick={savePT} className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700"><Save size={13} /></button><button onClick={() => { setEditingPTIdx(null); setPtDraft({}); }} className="p-1.5 rounded border border-slate-200"><X size={13} /></button></div></td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-4 font-medium">{test.testName}</td>
                              <td className="py-3 px-4 text-slate-600">{test.provider}</td>
                              <td className="py-3 px-4 text-slate-600">{test.dueDate}</td>
                              <td className="py-3 px-4"><Badge variant={badgeVariant[test.status] ?? "slate"}>{test.status}</Badge></td>
                              <td className="py-3 px-4">{test.score != null ? <span className={`font-bold ${test.score >= 90 ? "text-emerald-600" : test.score >= 80 ? "text-amber-600" : "text-rose-600"}`}>{test.score}%</span> : <span className="text-slate-400">—</span>}</td>
                              <td className="py-3 px-4">
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                  <button onClick={() => { setEditingPTIdx(idx); setPtDraft({ ...test }); setShowAddPT(false); }} className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"><Pencil size={13} /></button>
                                  <button onClick={() => setProficiencyTests((prev) => prev.filter((_, i) => i !== idx))} className="p-1.5 rounded border border-slate-200 text-rose-600 hover:bg-rose-50"><Trash2 size={13} /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {showAddPT ? (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <input value={ptDraft.testName ?? ""} onChange={(e) => setPtDraft((d) => ({ ...d, testName: e.target.value }))} className={inputCls} placeholder="Test name *" />
                  <input value={ptDraft.provider ?? ""} onChange={(e) => setPtDraft((d) => ({ ...d, provider: e.target.value }))} className={inputCls} placeholder="Provider *" />
                  <input type="date" value={ptDraft.dueDate ?? ""} onChange={(e) => setPtDraft((d) => ({ ...d, dueDate: e.target.value }))} className={inputCls} />
                  <select value={ptDraft.status ?? "pending"} onChange={(e) => setPtDraft((d) => ({ ...d, status: e.target.value as PTStatus }))} className={inputCls}>{PT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                  <div className="flex gap-2"><button onClick={savePT} className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-bold">Add</button><button onClick={() => { setShowAddPT(false); setPtDraft({}); }} className="flex-1 py-1.5 rounded-lg border border-slate-200 text-sm font-bold">Cancel</button></div>
                </div>
              ) : (
                <button onClick={() => { setShowAddPT(true); setEditingPTIdx(null); }} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700">
                  <Plus size={16} /> Add Proficiency Test
                </button>
              )}
            </div>
          </Card>

          {/* Audits + Doc Control */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Internal Audit Schedule" icon={Calendar}>
              <div className="space-y-3">
                {audits.length === 0 && !showAddAudit && (
                  <p className="py-6 text-center text-slate-400 text-sm">No audits scheduled yet. Click &ldquo;Schedule New Audit&rdquo; below to add one.</p>
                )}
                {audits.map((audit, idx) => {
                  const isEditing = editingAuditIdx === idx;
                  return (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-100">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input value={auditDraft.type ?? ""} onChange={(e) => setAuditDraft((d) => ({ ...d, type: e.target.value }))} className={inputCls} placeholder="Audit type" />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="date" value={auditDraft.date ?? ""} onChange={(e) => setAuditDraft((d) => ({ ...d, date: e.target.value }))} className={inputCls} />
                            <input value={auditDraft.auditor ?? ""} onChange={(e) => setAuditDraft((d) => ({ ...d, auditor: e.target.value }))} className={inputCls} placeholder="Auditor" />
                          </div>
                          <select value={auditDraft.status ?? "pending"} onChange={(e) => setAuditDraft((d) => ({ ...d, status: e.target.value as AuditStatus }))} className={inputCls}>{AUDIT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                          <div className="flex gap-2">
                            <button onClick={saveAudit} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center gap-1"><Save size={13} /> Save</button>
                            <button onClick={() => { setEditingAuditIdx(null); setAuditDraft({}); }} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1"><X size={13} /> Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-800 text-sm">{audit.type}</p>
                            <p className="text-xs text-slate-500">{audit.auditor} — {audit.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={badgeVariant[audit.status] ?? "slate"}>{audit.status}</Badge>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                              <button onClick={() => { setEditingAuditIdx(idx); setAuditDraft({ ...audit }); setShowAddAudit(false); }} className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50"><Pencil size={13} /></button>
                              <button onClick={() => setAudits((prev) => prev.filter((_, i) => i !== idx))} className="p-1.5 rounded border border-slate-200 text-rose-600 hover:bg-rose-50"><Trash2 size={13} /></button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {showAddAudit ? (
                  <div className="space-y-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                    <input value={auditDraft.type ?? ""} onChange={(e) => setAuditDraft((d) => ({ ...d, type: e.target.value }))} className={inputCls} placeholder="Audit type *" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={auditDraft.date ?? ""} onChange={(e) => setAuditDraft((d) => ({ ...d, date: e.target.value }))} className={inputCls} />
                      <input value={auditDraft.auditor ?? ""} onChange={(e) => setAuditDraft((d) => ({ ...d, auditor: e.target.value }))} className={inputCls} placeholder="Auditor *" />
                    </div>
                    <select value={auditDraft.status ?? "pending"} onChange={(e) => setAuditDraft((d) => ({ ...d, status: e.target.value as AuditStatus }))} className={inputCls}>{AUDIT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                    <div className="flex gap-2">
                      <button onClick={saveAudit} className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-bold">Add</button>
                      <button onClick={() => { setShowAddAudit(false); setAuditDraft({}); }} className="flex-1 py-1.5 rounded-lg border border-slate-200 text-sm font-bold">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setShowAddAudit(true); setEditingAuditIdx(null); }} className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-slate-300 rounded-xl text-slate-600 text-sm font-bold hover:border-blue-400 hover:text-blue-600">
                    <Plus size={16} /> Schedule New Audit
                  </button>
                )}
              </div>
            </Card>

            <Card title="Document Control System" icon={FileText}>
              {editingDocControl ? (
                <div className="space-y-3">
                  {(["totalDocuments", "controlledDocuments", "pendingReview", "overdueDocs"] as const).map((field) => (
                    <div key={field} className="flex items-center justify-between gap-4">
                      <label className="text-sm text-slate-600">{field.replace(/([A-Z])/g, " $1").trim()}</label>
                      <input type="number" value={docDraft[field]} onChange={(e) => setDocDraft((d) => ({ ...d, [field]: Number(e.target.value) }))} className="w-24 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-right" />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setDocControl(docDraft); setEditingDocControl(false); }} className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2"><Save size={14} /> Save</button>
                    <button onClick={() => { setDocDraft(docControl); setEditingDocControl(false); }} className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-bold flex items-center justify-center gap-2"><X size={14} /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-4 bg-slate-50 rounded-xl"><p className="text-2xl font-black text-blue-600">{docControl.totalDocuments}</p><p className="text-xs text-slate-500">Total</p></div>
                    <div className="text-center p-4 bg-slate-50 rounded-xl"><p className="text-2xl font-black text-emerald-600">{docControl.controlledDocuments}</p><p className="text-xs text-slate-500">Controlled</p></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between"><span className="text-sm text-slate-600">Pending Review</span><Badge variant="warning">{docControl.pendingReview}</Badge></div>
                    <div className="flex justify-between"><span className="text-sm text-slate-600">Overdue</span><Badge variant="danger">{docControl.overdueDocs}</Badge></div>
                  </div>
                  <button onClick={() => { setEditingDocControl(true); setDocDraft(docControl); }} className="w-full flex items-center justify-center gap-2 py-2 border border-slate-200 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-50"><Pencil size={14} /> Update Counts</button>
                </>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ── TIMELINE TAB ───────────────────────────────────────────────────── */}
      {tab === "timeline" && (
        <div className="space-y-6">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600"><Calendar size={20} /></div>
              <div>
                <p className="font-bold text-slate-800">NABL Accreditation Timeline</p>
                <p className="text-xs text-slate-500">Total estimated duration: 12–18 months from start</p>
              </div>
            </div>

            <div className="relative space-y-0">
              {TIMELINE_PHASES.map((phase, idx) => {
                const colors: Record<string, { bg: string; border: string; dot: string; text: string }> = {
                  blue: { bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-600", text: "text-blue-700" },
                  violet: { bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-600", text: "text-violet-700" },
                  amber: { bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", text: "text-amber-700" },
                  orange: { bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", text: "text-orange-700" },
                  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-600", text: "text-emerald-700" },
                };
                const c = colors[phase.color];
                return (
                  <div key={idx} className="relative flex gap-6">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-5 h-5 rounded-full ${c.dot} ring-4 ring-white z-10 shrink-0 mt-6`} />
                      {idx < TIMELINE_PHASES.length - 1 && <div className="w-0.5 flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className={`flex-1 rounded-2xl border ${c.border} ${c.bg} p-5 mb-4`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div>
                          <p className={`font-black text-base ${c.text}`}>{phase.phase}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Duration: {phase.duration}</p>
                        </div>
                        <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text} border ${c.border}`}>{phase.duration}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {phase.activities.map((activity, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                            <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
                            {activity}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Phase info table */}
          <Card title="Phase Summary" icon={TrendingUp}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-bold text-slate-600">Phase</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-600">Duration</th>
                    <th className="text-left py-3 px-4 font-bold text-slate-600">Key Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { phase: "Preparation", duration: "6–9 months", focus: "QMS, SOPs, staff training, equipment calibration" },
                    { phase: "Operational", duration: "3–6 months", focus: "IQC records, EQAS participation, internal audits" },
                    { phase: "Application", duration: "1–2 months", focus: "NABL application, document submission, pre-assessment" },
                    { phase: "Assessment", duration: "1–2 months", focus: "NABL visit, NCR closure, re-verification" },
                    { phase: "Accreditation", duration: "~1 month", focus: "Certificate issuance, NABL logo usage" },
                    { phase: "TOTAL", duration: "12–18 months", focus: "From start to accreditation" },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b border-slate-100 ${i === 5 ? "font-bold bg-slate-50" : ""}`}>
                      <td className="py-3 px-4">{row.phase}</td>
                      <td className="py-3 px-4 text-slate-600">{row.duration}</td>
                      <td className="py-3 px-4 text-slate-600">{row.focus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
