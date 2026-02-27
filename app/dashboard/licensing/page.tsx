"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import {
  FileCheck,
  Plus,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText,
  ExternalLink,
  Clock,
  ShieldAlert,
  X,
} from "lucide-react";

interface License {
  _id: string;
  type: string;
  state: string;
  status: string;
  renewalDate?: string;
  documents: { name: string; url: string; uploaded?: boolean }[];
}

const LICENSE_TYPES = [
  "Clinical Establishment Registration",
  "Biomedical Waste (BMW) Authorization",
  "Fire Safety NOC",
  "Trade License",
  "GST Registration",
  "NABL Accreditation",
  "Pollution Control Board Consent",
];

const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const GUIDELINES: Record<string, { docs: string[]; templates: { name: string; url: string }[]; authority: string }> = {
  "Clinical Establishment Registration": {
    docs: ["Proof of Ownership/Rent Agreement", "Layout Plan (Blueprints)", "Fire NOC", "Staff Qualification Proofs", "Equipment List"],
    templates: [
      {
        name: "Application Form A",
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`FORM 'A'
[See Rule 8]
APPLICATION FOR REGISTRATION OF CLINICAL ESTABLISHMENT

To,
The District Health Authority,
[District Name]

Sir/Madam,

I/We hereby apply for registration of the following Clinical Establishment.

1. Name of the Clinical Establishment: __________________________
2. Address: __________________________
3. Type of Establishment (Lab/Clinic/Hospital): __________________________
4. Name of Owner: __________________________
5. Qualification of Staff: __________________________

I/We undertake to abide by the rules and regulations of the Clinical Establishments Act.

Date: ____________
Signature of Applicant`)}`
      },
      {
        name: "Self-Declaration Affidavit",
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`AFFIDAVIT / SELF-DECLARATION

I, __________________________, son/daughter of __________________________, resident of __________________________, do hereby solemnly affirm and declare as under:

1. That I am the owner/partner of [Clinical Establishment Name].
2. That the establishment complies with all the minimum standards prescribed under the Clinical Establishments Act.
3. That the staff employed is qualified and registered with respective councils.
4. That the rates for various services are displayed at a conspicuous place.

Deponent

Verification:
Verified that the contents of my above affidavit are true and correct to the best of my knowledge.

Date: ____________
Place: ____________`)}`
      }
    ],
    authority: "District Health Office",
  },
  "Biomedical Waste (BMW) Authorization": {
    docs: ["Agreement with CBWTF", "Consent to Establish (Pollution Control)", "Waste Management Plan"],
    templates: [
      {
        name: "Form II (Application)",
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`FORM II
[See rule 10]
APPLICATION FOR AUTHORISATION OR RENEWAL OF AUTHORISATION

To,
The State Pollution Control Board,
[State Name]

1. Particulars of Applicant: __________________________
2. Name of the Health Care Facility: __________________________
3. Address: __________________________
4. Activity for which authorisation is sought:
   ( ) Generation
   ( ) Segregation
   ( ) Collection
   ( ) Storage
   ( ) Packaging
   ( ) Reception
   ( ) Transportation
   ( ) Treatment or processing or conversion
   ( ) Recycling
   ( ) Disposal or destruction
   ( ) Use
   ( ) Offering for sale, transfer
   ( ) Any other form of handling

5. Details of Bio-Medical Waste Management:
   (i) Quantity of waste generated per day: ______ kg
   (ii) Mode of disposal: Agreement with [CBWTF Name]

Date: ____________
Signature`)}`
      },
      {
        name: "Annual Report Format",
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`FORM IV
[See rule 13]
ANNUAL REPORT

[To be submitted to the prescribed authority on or before 30th June every year for the period from January to December of the preceding year]

1. Particulars of the Occupier: __________________________
2. Name of the Health Care Facility: __________________________
3. Categories of Waste Generated and Quantity on a monthly average basis:
   - Yellow Category: ______ kg
   - Red Category: ______ kg
   - White Category: ______ kg
   - Blue Category: ______ kg

4. Liquid waste generated and treatment methods in place: __________________________
5. Details of the Storage, treatment, transportation, processing and Disposal Facility: __________________________

Certified that the above report is for the period from [Date] to [Date].

Date: ____________
Signature`)}`
      }
    ],
    authority: "State Pollution Control Board",
  },
  "Fire Safety NOC": {
    docs: ["Building Plan Approval", "Fire Extinguisher Invoice", "Electrical Safety Certificate"],
    templates: [
      {
        name: "Fire Safety Audit Checklist",
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`FIRE SAFETY SELF-AUDIT CHECKLIST

1. Building Details:
   - Height: ______ meters
   - Number of Floors: ______
   - Total Area: ______ sq. ft.

2. Fire Protection Systems:
   - Fire Extinguishers (Type & Qty): __________________________
   - Hose Reels: [ ] Yes [ ] No
   - Smoke Detectors: [ ] Yes [ ] No
   - Fire Alarm System: [ ] Yes [ ] No

3. Means of Escape:
   - Staircase width: ______ meters
   - Emergency Exits marked: [ ] Yes [ ] No
   - Exits free from obstruction: [ ] Yes [ ] No

4. Electrical Safety:
   - MCB/ELCB installed: [ ] Yes [ ] No
   - Wiring condition checked: [ ] Yes [ ] No

Date of Audit: ____________
Signature of Owner`)}`
      }
    ],
    authority: "Fire Department",
  },
  "Trade License": {
    docs: ["Occupancy Certificate", "Property Tax Receipt", "ID Proof of Owner"],
    templates: [
      {
        name: "Trade License Application Form",
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`APPLICATION FOR GRANT OF TRADE LICENSE

To,
The Municipal Commissioner,
[Corporation Name]

Sir,

I/We request you to grant a Trade License for running a Clinical Laboratory.

1. Name of the Trade: __________________________
2. Address of the Premises: __________________________
3. Name of the Applicant: __________________________
4. Nature of Business: Diagnostic Centre / Pathology Lab
5. Area of the Premises: ______ sq. ft.
6. Property Tax Assessment No: __________________________

I/We enclose herewith the necessary documents and fees.

Date: ____________
Signature`)}`
      }
    ],
    authority: "Municipal Corporation",
  },
  "GST Registration": {
    docs: ["PAN Card of Entity", "Incorporation Certificate", "Address Proof", "Bank Account Details"],
    templates: [],
    authority: "GST Portal",
  },
  "NABL Accreditation": {
    docs: ["Quality Manual (ISO 15189)", "SOPs for all tests", "Internal Audit Report", "PT/EQAS Participation Proof"],
    templates: [
      {
        name: "Quality Manual Template",
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`QUALITY MANUAL
(Based on ISO 15189:2012)

1. SCOPE
   This manual describes the Quality Management System of [Lab Name].

2. QUALITY POLICY
   We are committed to providing accurate, timely, and reliable diagnostic services...

3. ORGANIZATION AND MANAGEMENT
   - Legal Entity
   - Ethical Conduct
   - Laboratory Director Responsibilities

4. RESOURCE MANAGEMENT
   - Personnel
   - Facilities and Environmental Conditions
   - Laboratory Equipment, Reagents, and Consumables

5. EXAMINATION PROCESSES
   - Pre-examination processes
   - Examination processes
   - Post-examination processes

6. QUALITY MANAGEMENT SYSTEM ISSUES
   - Document Control
   - Service Agreements
   - Examination by Referral Laboratories
   - External Services and Supplies
   - Advisory Services
   - Resolution of Complaints
   - Identification and Control of Nonconformities
   - Corrective Action
   - Preventive Action
   - Continual Improvement
   - Control of Records
   - Evaluation and Audits
   - Management Review`)}`
      },
      {
        name: "SOP Template",
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`STANDARD OPERATING PROCEDURE (SOP)

Title: __________________________
SOP Number: __________________________
Version: ______
Effective Date: ____________

1. PURPOSE
   [Describe the purpose of this procedure]

2. SCOPE
   [Describe where this procedure applies]

3. RESPONSIBILITY
   [Who is responsible for performing this task]

4. PRINCIPLE
   [Scientific principle involved]

5. SAMPLE REQUIREMENTS
   [Type of sample, volume, container]

6. EQUIPMENT AND REAGENTS
   [List of equipment and reagents required]

7. PROCEDURE
   [Step-by-step instructions]

8. QUALITY CONTROL
   [Controls to be run, acceptance criteria]

9. CALCULATIONS
   [Formulae if any]

10. REFERENCE RANGES
    [Normal values]

11. REFERENCES
    [Books, articles, manuals]`)}`
      }
    ],
    authority: "NABL (QCI)",
  },
  "Pollution Control Board Consent": {
    docs: ["Site Plan", "Water Consumption Details", "BMW Authorization Copy"],
    templates: [
      {
        name: "Consent to Establish Form",
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(`APPLICATION FOR CONSENT FOR ESTABLISHMENT
(Under Water Act 1974 & Air Act 1981)

To,
The Member Secretary,
State Pollution Control Board.

1. General Information:
   - Name of Industry/Institution: __________________________
   - Location: __________________________
   - Correspondence Address: __________________________

2. Water Consumption:
   - Domestic: ______ KLD
   - Industrial/Lab washing: ______ KLD

3. Wastewater Generation:
   - Domestic: ______ KLD
   - Trade Effluent: ______ KLD

4. Air Emission Details:
   - DG Set Capacity: ______ KVA
   - Height of Stack: ______ meters

5. Hazardous/Bio-Medical Waste Management:
   - Authorization No (if any): __________________________

Date: ____________
Signature`)}`
      }
    ],
    authority: "State Pollution Control Board",
  }
};

export default function LicensingPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState(LICENSE_TYPES[0]);
  const [state, setState] = useState("Maharashtra");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/licenses")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setLicenses(data);
        else setLicenses([]);
      })
      .catch(() => setLicenses([]))
      .finally(() => setLoading(false));
  }, []);

  const addLicense = async () => {
    const res = await fetch("/api/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, state, status: "pending" }),
    });
    if (res.ok) {
      const newLicense = await res.json();
      setLicenses((prev) => [newLicense, ...prev]);
      setShowForm(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const statusVariant = (s: string) => (s === "approved" ? "success" : s === "applied" ? "info" : "slate");

  const getRenewalStatus = (dateStr?: string) => {
    if (!dateStr) return null;
    const days = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: "Expired", color: "text-rose-600", bg: "bg-rose-50" };
    if (days < 30) return { label: `Expiring in ${days} days`, color: "text-amber-600", bg: "bg-amber-50" };
    return { label: `Valid till ${new Date(dateStr).toLocaleDateString()}`, color: "text-emerald-600", bg: "bg-emerald-50" };
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-muted-foreground">Loading licensing module…</p>
      </div>
    );
  }

  const safeLicenses = Array.isArray(licenses) ? licenses : [];

  const stats = {
    total: safeLicenses.length,
    approved: safeLicenses.filter(l => l.status === "approved").length,
    pending: safeLicenses.filter(l => l.status === "pending").length,
    critical: safeLicenses.filter(l => l.renewalDate && new Date(l.renewalDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Licensing & Compliance</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Selected State: <span className="font-bold text-slate-700">{state}</span> — State-based checklists, document uploads, and renewal reminders.
            State-based checklists, document uploads, and renewal reminders.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />} {showForm ? "Cancel" : "Add License"}
        </button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Licenses</p>
          <p className="text-2xl font-black text-slate-800">{stats.total}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approved</p>
          <p className="text-2xl font-black text-emerald-600">{stats.approved}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Action</p>
          <p className="text-2xl font-black text-blue-600">{stats.pending}</p>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Renewal Alerts</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-black ${stats.critical > 0 ? "text-rose-600" : "text-slate-300"}`}>{stats.critical}</p>
            {stats.critical > 0 && <AlertCircle size={20} className="text-rose-500 animate-pulse" />}
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card title="Add New License" className="animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">License Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {LICENSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">State / Region</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={addLicense} className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                Create Tracker
              </button>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-blue-500" /> Requirements Preview
              </h4>
              <p className="text-xs text-slate-500 mb-3">Authority: <span className="font-semibold">{GUIDELINES[type]?.authority || "Local Authority"}</span></p>
              <ul className="space-y-2">
                {GUIDELINES[type]?.docs.slice(0, 4).map((doc, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    {doc}
                  </li>
                ))}
                {(GUIDELINES[type]?.docs.length || 0) > 4 && (
                  <li className="text-xs text-blue-600 font-medium pl-3.5">+ {(GUIDELINES[type]?.docs.length || 0) - 4} more documents</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* License List */}
      <Card title="License Tracker" icon={FileCheck}>
        {safeLicenses.length === 0 && !showForm && (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-slate-50 rounded-full mb-3">
              <ShieldAlert size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No licenses tracked yet.</p>
            <p className="text-sm text-slate-400">Add your first license to generate a compliance checklist.</p>
          </div>
        )}
        <div className="space-y-4">
          {safeLicenses.map((lic) => {
            const renewal = getRenewalStatus(lic.renewalDate);
            const guide = GUIDELINES[lic.type] || { docs: [], templates: [] };
            const isExpanded = expandedId === lic._id;

            return (
              <div
                key={lic._id}
                className={`rounded-xl border transition-all duration-200 ${
                  isExpanded ? "border-blue-200 bg-blue-50/10 ring-1 ring-blue-100" : "border-slate-100 bg-white hover:border-blue-200"
                }`}
              >
                {/* Card Header */}
                <div 
                  className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer"
                  onClick={() => toggleExpand(lic._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${lic.status === "approved" ? "bg-emerald-100 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm md:text-base">{lic.type}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-slate-500">{lic.state}</span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-xs font-medium text-slate-500">{guide.authority}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-auto">
                    {renewal && (
                      <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${renewal.bg} ${renewal.color}`}>
                        <Clock size={12} /> {renewal.label}
                      </div>
                    )}
                    <Badge variant={statusVariant(lic.status)}>{lic.status}</Badge>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-slate-100 mt-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                      {/* Checklist Section */}
                      <div className="lg:col-span-2 space-y-3">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Document Checklist</h4>
                        <div className="space-y-2">
                          {guide.docs.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 group hover:bg-white hover:border-blue-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded border border-slate-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500">
                                  {/* Mock checkbox logic */}
                                </div>
                                <span className="text-sm text-slate-700 font-medium">{doc}</span>
                              </div>
                              <button className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Upload</button>
                            </div>
                          ))}
                          {guide.docs.length === 0 && <p className="text-sm text-slate-400 italic">No specific documents listed.</p>}
                        </div>
                      </div>

                      {/* Actions & Templates */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Templates</h4>
                          <div className="space-y-2">
                            {guide.templates.map((tmpl, idx) => (
                              <a
                                key={idx}
                                href={tmpl.url}
                                download={`${tmpl.name}.txt`}
                                className="w-full flex items-center gap-2 p-2 text-left text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Download size={14} /> {tmpl.name}
                              </a>
                            ))}
                            {guide.templates.length === 0 && <p className="text-xs text-slate-400">No templates available.</p>}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Actions</h4>
                          <div className="flex flex-col gap-2">
                            <button className="flex items-center justify-center gap-2 w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
                              <ExternalLink size={14} /> Visit {guide.authority} Portal
                            </button>
                            <button className="flex items-center justify-center gap-2 w-full py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">
                              Update Status
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
