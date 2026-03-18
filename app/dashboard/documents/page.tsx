"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import {
  FileText,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  FileCheck,
  Sparkles,
  Shield,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocumentType {
  type: string;
  name: string;
  description: string;
  requiredFields: string[];
}

interface ValidationResult {
  isValid: boolean;
  confidenceScore: number;
  issues: string[];
  suggestions: string[];
}

interface GapAnalysisResult {
  missingDocuments: string[];
  presentDocuments: string[];
  completionPercentage: number;
  recommendations: string[];
  priorityActions: string[];
}

interface LabProfile {
  organizationName: string;
  address: string;
  contact: string;
  owner: string;
  pathologist: string;
  area: string;
  testMenu: string;
  equipment: string;
  staff: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim",
  "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
];

const DOC_TYPE_ICONS: Record<string, React.ElementType> = {
  cea_application:    FileCheck,
  bmw_management_plan: Shield,
  quality_manual:     FileText,
};

const DOC_TYPE_COLORS: Record<string, { bg: string; icon: string; border: string }> = {
  cea_application:    { bg: "bg-blue-50",   icon: "text-blue-600",   border: "border-blue-200" },
  bmw_management_plan: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200" },
  quality_manual:     { bg: "bg-amber-50",  icon: "text-amber-600",  border: "border-amber-200" },
};

const FIELD_LABELS: Record<string, string> = {
  organizationName: "Organization Name",
  address:          "Full Address",
  contact:          "Contact Number / Email",
  owner:            "Owner / Authorized Signatory",
  pathologist:      "Pathologist Name & Qualification",
  area:             "Lab Area (sq ft)",
  testMenu:         "Test Menu (comma-separated)",
  equipment:        "Equipment List (comma-separated)",
  staff:            "Staff List (comma-separated)",
};

const LICENSE_TYPES_FOR_GAP = [
  { value: "bmw", label: "BMW Authorization" },
  { value: "cea", label: "Clinical Establishment Registration" },
  { value: "nabl", label: "NABL Accreditation" },
  { value: "fire_noc", label: "Fire Safety NOC" },
  { value: "trade_license", label: "Trade License" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  // Generate tab
  const [activeDoc, setActiveDoc] = useState<DocumentType | null>(null);
  const [labProfile, setLabProfile] = useState<LabProfile>({
    organizationName: "", address: "", contact: "", owner: "",
    pathologist: "", area: "", testMenu: "", equipment: "", staff: "",
  });
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Validate tab
  const [validateTab, setValidateTab] = useState<"upload" | "gap">("upload");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocType, setUploadDocType] = useState("cea_application");
  const [uploadState, setUploadState] = useState("Maharashtra");
  const [uploadDistrict, setUploadDistrict] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [validateError, setValidateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gap analysis
  const [gapLicenseType, setGapLicenseType] = useState("bmw");
  const [gapState, setGapState] = useState("Maharashtra");
  const [gapDistrict, setGapDistrict] = useState("");
  const [gapDocsList, setGapDocsList] = useState("");
  const [analyzingGap, setAnalyzingGap] = useState(false);
  const [gapResult, setGapResult] = useState<GapAnalysisResult | null>(null);
  const [gapError, setGapError] = useState<string | null>(null);

  // Active tab: "generate" | "validate"
  const [mainTab, setMainTab] = useState<"generate" | "validate">("generate");

  useEffect(() => {
    fetch("/api/documents/generate")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.documentTypes) {
          setDocTypes(data.documentTypes);
          setActiveDoc(data.documentTypes[0] ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTypes(false));
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!activeDoc) return;
    setGenerating(true);
    setGenerateError(null);

    const profile = {
      organizationName: labProfile.organizationName,
      address: labProfile.address,
      contact: labProfile.contact,
      owner: labProfile.owner,
      pathologist: labProfile.pathologist,
      area: labProfile.area ? Number(labProfile.area) : undefined,
      testMenu: labProfile.testMenu ? labProfile.testMenu.split(",").map((t) => t.trim()).filter(Boolean) : [],
      equipment: labProfile.equipment ? labProfile.equipment.split(",").map((e) => e.trim()).filter(Boolean) : [],
      staff: labProfile.staff ? labProfile.staff.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };

    try {
      const res = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: activeDoc.type, labProfile: profile }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setGenerateError(d?.error ?? "Failed to generate document.");
        return;
      }

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="?(.+?)"?$/);
      a.download = match?.[1] ?? `${activeDoc.type}.docx`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setGenerateError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [activeDoc, labProfile]);

  const handleValidate = useCallback(async () => {
    if (!uploadFile) return;
    setValidating(true);
    setValidateError(null);
    setValidationResult(null);

    const formData = new FormData();
    formData.append("document", uploadFile);
    formData.append("documentType", uploadDocType);
    formData.append("state", uploadState);
    if (uploadDistrict) formData.append("district", uploadDistrict);

    try {
      const res = await fetch("/api/documents/validate", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setValidationResult(data.validation ?? null);
      } else {
        const d = await res.json().catch(() => null);
        setValidateError(d?.error ?? "Validation failed.");
      }
    } catch {
      setValidateError("Network error. Please try again.");
    } finally {
      setValidating(false);
    }
  }, [uploadFile, uploadDocType, uploadState, uploadDistrict]);

  const handleGapAnalysis = useCallback(async () => {
    setAnalyzingGap(true);
    setGapError(null);
    setGapResult(null);

    const docs = gapDocsList.split(",").map((d) => d.trim()).filter(Boolean);
    const params = new URLSearchParams({
      licenseType: gapLicenseType,
      state: gapState,
      ...(gapDistrict && { district: gapDistrict }),
      ...(docs.length > 0 && { documents: docs.join(",") }),
    });

    try {
      const res = await fetch(`/api/documents/validate?${params}`);
      if (res.ok) {
        const data = await res.json();
        setGapResult(data.gapAnalysis ?? null);
      } else {
        const d = await res.json().catch(() => null);
        setGapError(d?.error ?? "Gap analysis failed.");
      }
    } catch {
      setGapError("Network error. Please try again.");
    } finally {
      setAnalyzingGap(false);
    }
  }, [gapLicenseType, gapState, gapDistrict, gapDocsList]);

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setUploadFile(file);
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6 md:p-8 animate-fade-in-up">

      {/* Page Header */}
      <div className="flex items-start gap-3 pb-6 border-b border-gray-100">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50">
          <FileText size={17} className="text-orange-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Documents &amp; AI Validation</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Generate regulatory documents and validate compliance submissions using AI.
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card"><p className="stat-label">Doc Templates</p><p className="stat-value mt-1">{docTypes.length}</p></div>
        <div className="stat-card"><p className="stat-label">AI Validation</p><p className="stat-value mt-1 text-emerald-700">Live</p></div>
        <div className="stat-card"><p className="stat-label">Gap Analysis</p><p className="stat-value mt-1 text-blue-700">On</p></div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(["generate", "validate"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors capitalize ${
              mainTab === tab ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "generate" ? (
              <span className="flex items-center gap-2"><Download size={15} /> Generate</span>
            ) : (
              <span className="flex items-center gap-2"><Shield size={15} /> AI Validate</span>
            )}
          </button>
        ))}
      </div>

      {/* ── GENERATE TAB ── */}
      {mainTab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Document Type Selector */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Document Type</p>
            {loadingTypes ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              docTypes.map((doc) => {
                const Icon = DOC_TYPE_ICONS[doc.type] ?? FileText;
                const colors = DOC_TYPE_COLORS[doc.type] ?? { bg: "bg-slate-50", icon: "text-slate-600", border: "border-slate-200" };
                const isActive = activeDoc?.type === doc.type;
                return (
                  <button
                    key={doc.type}
                    onClick={() => { setActiveDoc(doc); setGenerateError(null); }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isActive
                        ? `${colors.bg} ${colors.border} ring-2 ring-offset-1 ring-blue-400`
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <Icon size={18} className={colors.icon} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm leading-tight">{doc.name}</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{doc.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Form + Generate */}
          {activeDoc && (
            <div className="lg:col-span-2">
              <Card
                title={activeDoc.name}
                subtitle="Fill in the lab details to generate your document"
                icon={Sparkles}
              >
                <div className="space-y-4">
                  {generateError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                      {generateError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeDoc.requiredFields.map((field) => {
                      const label = FIELD_LABELS[field] ?? field;
                      const isTextarea = ["testMenu", "equipment", "staff"].includes(field);
                      return (
                        <div key={field} className={isTextarea ? "md:col-span-2" : ""}>
                          <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                          {isTextarea ? (
                            <textarea
                              value={(labProfile as Record<string, string>)[field] ?? ""}
                              onChange={(e) => setLabProfile((p) => ({ ...p, [field]: e.target.value }))}
                              rows={2}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                              placeholder={`e.g. ${field === "testMenu" ? "CBC, LFT, RFT, Urine Routine" : field === "equipment" ? "Hematology Analyzer, Biochemistry Analyzer" : "Dr. Priya (Pathologist), Ravi (Technician)"}`}
                            />
                          ) : (
                            <input
                              type={field === "area" ? "number" : "text"}
                              value={(labProfile as Record<string, string>)[field] ?? ""}
                              onChange={(e) => setLabProfile((p) => ({ ...p, [field]: e.target.value }))}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                              placeholder={field === "area" ? "e.g. 500" : `Enter ${label.toLowerCase()}`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Required Fields Note */}
                  <p className="text-xs text-slate-400">
                    Required fields for this document: {" "}
                    {activeDoc.requiredFields.map((f) => FIELD_LABELS[f] ?? f).join(", ")}
                  </p>

                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <><Loader2 size={16} className="animate-spin" /> Generating Document…</>
                    ) : (
                      <><Download size={16} /> Generate & Download .docx</>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    Document is generated using AI and auto-formatted per Indian regulatory standards.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ── VALIDATE TAB ── */}
      {mainTab === "validate" && (
        <div className="space-y-6">
          {/* Sub-tabs */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
            {(["upload", "gap"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setValidateTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${
                  validateTab === tab ? "bg-white shadow text-slate-800" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab === "upload" ? "Validate Document" : "Gap Analysis"}
              </button>
            ))}
          </div>

          {/* Upload & Validate */}
          {validateTab === "upload" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Upload Document for AI Validation" icon={Upload}>
                <div className="space-y-4">
                  {validateError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                      {validateError}
                    </div>
                  )}

                  {/* File Drop Zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                      uploadFile ? "border-emerald-300 bg-emerald-50" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                    />
                    {uploadFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileCheck size={24} className="text-emerald-600" />
                        <div className="text-left">
                          <p className="font-bold text-slate-800 text-sm">{uploadFile.name}</p>
                          <p className="text-xs text-slate-500">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                          className="ml-2 p-1 rounded-lg hover:bg-slate-100"
                        >
                          <X size={16} className="text-slate-400" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={28} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-semibold text-slate-600">Drop file here or click to browse</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, Word, or Image (JPG/PNG)</p>
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                      <select
                        value={uploadDocType}
                        onChange={(e) => setUploadDocType(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="cea_application">CEA Application</option>
                        <option value="bmw_management_plan">BMW Management Plan</option>
                        <option value="quality_manual">Quality Manual</option>
                        <option value="fire_noc">Fire Safety NOC</option>
                        <option value="trade_license">Trade License</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                        <select
                          value={uploadState}
                          onChange={(e) => setUploadState(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">District (optional)</label>
                        <input
                          value={uploadDistrict}
                          onChange={(e) => setUploadDistrict(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          placeholder="e.g. Pune"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleValidate}
                    disabled={!uploadFile || validating}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {validating ? (
                      <><Loader2 size={16} className="animate-spin" /> Validating with AI…</>
                    ) : (
                      <><Sparkles size={16} /> Validate with AI</>
                    )}
                  </button>
                </div>
              </Card>

              {/* Validation Result */}
              {validationResult && (
                <Card title="Validation Result" icon={validationResult.isValid ? CheckCircle2 : AlertTriangle}>
                  <div className="space-y-4">
                    {/* Score */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-4xl font-black text-slate-800">
                          {validationResult.confidenceScore}
                          <span className="text-xl text-slate-400">%</span>
                        </p>
                        <p className="text-xs text-slate-500 font-medium">Confidence Score</p>
                      </div>
                      <Badge variant={validationResult.isValid ? "success" : "danger"}>
                        {validationResult.isValid ? "Valid Document" : "Issues Found"}
                      </Badge>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${validationResult.confidenceScore >= 80 ? "bg-emerald-500" : validationResult.confidenceScore >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${validationResult.confidenceScore}%` }}
                      />
                    </div>

                    {validationResult.issues.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-2">Issues Found</p>
                        <ul className="space-y-1.5">
                          {validationResult.issues.map((issue, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2 border border-rose-100">
                              <AlertTriangle size={14} className="shrink-0 mt-0.5" /> {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validationResult.suggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Suggestions</p>
                        <ul className="space-y-1.5">
                          {validationResult.suggestions.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                              <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-blue-500" /> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Placeholder when no result yet */}
              {!validationResult && !validating && (
                <Card title="Validation Result" icon={Shield}>
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                    <div className="p-4 bg-slate-50 rounded-full">
                      <Shield size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-semibold">No result yet</p>
                    <p className="text-sm text-slate-400">Upload a document and click Validate to see AI analysis here.</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Gap Analysis */}
          {validateTab === "gap" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Document Gap Analysis" icon={Search}>
                <div className="space-y-4">
                  {gapError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                      {gapError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">License Type</label>
                    <select
                      value={gapLicenseType}
                      onChange={(e) => setGapLicenseType(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      {LICENSE_TYPES_FOR_GAP.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                      <select
                        value={gapState}
                        onChange={(e) => setGapState(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">District (optional)</label>
                      <input
                        value={gapDistrict}
                        onChange={(e) => setGapDistrict(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        placeholder="e.g. Pune"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Documents You Already Have{" "}
                      <span className="text-slate-400 font-normal">(comma-separated, optional)</span>
                    </label>
                    <textarea
                      value={gapDocsList}
                      onChange={(e) => setGapDocsList(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-none"
                      placeholder="e.g. CBWTF Agreement, BMW Management Plan, Consent to Establish"
                    />
                  </div>

                  <button
                    onClick={handleGapAnalysis}
                    disabled={analyzingGap}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {analyzingGap ? (
                      <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
                    ) : (
                      <><Sparkles size={16} /> Run Gap Analysis</>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400">
                    AI will compare your documents against state-specific requirements and identify what&apos;s missing.
                  </p>
                </div>
              </Card>

              {/* Gap Result */}
              {gapResult && (
                <Card title="Gap Analysis Result" icon={FileCheck}>
                  <div className="space-y-4">
                    {/* Completion */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-4xl font-black text-slate-800">
                          {Math.round(gapResult.completionPercentage ?? 0)}
                          <span className="text-xl text-slate-400">%</span>
                        </p>
                        <p className="text-xs text-slate-500 font-medium">Document Completion</p>
                      </div>
                      <Badge variant={(gapResult.completionPercentage ?? 0) >= 80 ? "success" : (gapResult.completionPercentage ?? 0) >= 50 ? "warning" : "danger"}>
                        {(gapResult.completionPercentage ?? 0) >= 80 ? "Ready" : "Incomplete"}
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${(gapResult.completionPercentage ?? 0) >= 80 ? "bg-emerald-500" : (gapResult.completionPercentage ?? 0) >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                        style={{ width: `${gapResult.completionPercentage ?? 0}%` }}
                      />
                    </div>

                    {/* Missing */}
                    {gapResult.missingDocuments?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-2">Missing Documents</p>
                        <ul className="space-y-1.5">
                          {gapResult.missingDocuments.map((doc, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 rounded-lg px-3 py-2 border border-rose-100">
                              <X size={14} className="shrink-0 text-rose-500" /> {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Present */}
                    {gapResult.presentDocuments?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">Documents Present</p>
                        <ul className="space-y-1.5">
                          {gapResult.presentDocuments.map((doc, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 border border-emerald-100">
                              <CheckCircle2 size={14} className="shrink-0 text-emerald-500" /> {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Priority Actions */}
                    {gapResult.priorityActions?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Priority Actions</p>
                        <ul className="space-y-1.5">
                          {gapResult.priorityActions.map((action, i) => (
                            <li key={i} className="text-sm text-blue-700 bg-blue-50 rounded-lg px-3 py-2 border border-blue-100">
                              {i + 1}. {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {!gapResult && !analyzingGap && (
                <Card title="Gap Analysis Result" icon={FileText}>
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                    <div className="p-4 bg-slate-50 rounded-full">
                      <Search size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-semibold">No analysis yet</p>
                    <p className="text-sm text-slate-400">Select a license type and run gap analysis to see what documents you still need.</p>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
