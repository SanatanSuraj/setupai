"use client";

import { useEffect, useState, useMemo } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import {
  FileCheck,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  ShieldAlert,
  X,
  Filter,
  CheckCircle2,
} from "lucide-react";
import {
  LICENSE_CATALOG,
  CATEGORY_LABELS,
  type LicenseCatalogItem,
  type LicenseCategory,
} from "@/lib/license-catalog";

interface License {
  _id: string;
  type: string;
  state: string;
  status: string;
  renewalDate?: string;
  documents: { name: string; url: string; uploaded?: boolean }[];
}

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
  "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const GUIDELINES: Record<string, { docs: string[]; templates: { name: string; url: string }[]; authority: string }> = {
  "Clinical Establishment Registration": {
    docs: ["Proof of Ownership/Rent Agreement", "Layout Plan (Blueprints)", "Fire NOC", "Staff Qualification Proofs", "Equipment List"],
    templates: [{ name: "Application Form A", url: "data:text/plain,Form A" }, { name: "Self-Declaration Affidavit", url: "data:text/plain,Affidavit" }],
    authority: "District Health Office",
  },
  "Biomedical Waste (BMW) Authorization": {
    docs: ["Agreement with CBWTF", "Consent to Establish (Pollution Control)", "Waste Management Plan"],
    templates: [{ name: "Form II (Application)", url: "data:text/plain,Form II" }, { name: "Annual Report Format", url: "data:text/plain,Annual Report" }],
    authority: "State Pollution Control Board",
  },
  "Fire Safety NOC": {
    docs: ["Building Plan Approval", "Fire Extinguisher Invoice", "Electrical Safety Certificate"],
    templates: [{ name: "Fire Safety Audit Checklist", url: "data:text/plain,Checklist" }],
    authority: "Fire Department",
  },
  "Trade License": {
    docs: ["Occupancy Certificate", "Property Tax Receipt", "ID Proof of Owner"],
    templates: [{ name: "Trade License Application Form", url: "data:text/plain,Trade Form" }],
    authority: "Municipal Corporation",
  },
  "GST Registration": {
    docs: ["PAN Card of Entity", "Incorporation Certificate", "Address Proof", "Bank Account Details"],
    templates: [],
    authority: "GST Portal",
  },
  "NABL Accreditation": {
    docs: ["Quality Manual (ISO 15189)", "SOPs for all tests", "Internal Audit Report", "PT/EQAS Participation Proof"],
    templates: [{ name: "Quality Manual Template", url: "data:text/plain,Quality Manual" }, { name: "SOP Template", url: "data:text/plain,SOP" }],
    authority: "NABL (QCI)",
  },
  "Pollution Control Board Consent": {
    docs: ["Site Plan", "Water Consumption Details", "BMW Authorization Copy"],
    templates: [{ name: "Consent to Establish Form", url: "data:text/plain,Consent Form" }],
    authority: "State Pollution Control Board",
  },
};

export default function LicensingPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<LicenseCategory | "all">("all");
  const [applyModal, setApplyModal] = useState<LicenseCatalogItem | null>(null);
  const [applyState, setApplyState] = useState("Maharashtra");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/licenses")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLicenses(Array.isArray(data) ? data : []))
      .catch(() => setLicenses([]))
      .finally(() => setLoading(false));
  }, []);

  const addLicense = async (item: LicenseCatalogItem, state: string) => {
    const res = await fetch("/api/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: item.name, state, status: "pending" }),
    });
    if (res.ok) {
      const newLicense = await res.json();
      setLicenses((prev) => [newLicense, ...prev]);
      setApplyModal(null);
    }
  };

  const updateLicenseStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/licenses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const json = await res.json();
      const updated = json.data ?? json;
      setLicenses((prev) => prev.map((l) => (l._id === id ? { ...l, ...updated } : l)));
    }
  };

  const filteredCatalog = useMemo(() => {
    let list = LICENSE_CATALOG;
    if (filterCategory !== "all") {
      list = list.filter((l) => l.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.shortDescription.toLowerCase().includes(q) ||
          l.authority.toLowerCase().includes(q)
      );
    }
    return list;
  }, [searchQuery, filterCategory]);

  const toggleExpand = (id: string) => setExpandedId((x) => (x === id ? null : id));
  const statusVariant = (s: string) => (s === "approved" ? "success" : s === "submitted" || s === "in_progress" ? "info" : "slate");
  const getRenewalStatus = (dateStr?: string) => {
    if (!dateStr) return null;
    const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: "Expired", color: "text-rose-600", bg: "bg-rose-50" };
    if (days < 30) return { label: `Expiring in ${days}d`, color: "text-amber-600", bg: "bg-amber-50" };
    return { label: `Valid till ${new Date(dateStr).toLocaleDateString()}`, color: "text-emerald-600", bg: "bg-emerald-50" };
  };

  const safeLicenses = Array.isArray(licenses) ? licenses : [];
  const stats = {
    total: safeLicenses.length,
    approved: safeLicenses.filter((l) => l.status === "approved").length,
    pending: safeLicenses.filter((l) => l.status === "pending" || l.status === "submitted").length,
    critical: safeLicenses.filter((l) => l.renewalDate && new Date(l.renewalDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <div className="h-48 rounded-2xl skeleton" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-20 rounded-xl skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 p-6 md:p-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex items-start gap-3 pb-6 border-b border-gray-100">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
          <FileCheck size={17} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Licensing &amp; Compliance</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Browse, apply, and track all lab licenses in one place.
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card"><p className="stat-label">Total Applied</p><p className="stat-value mt-1">{stats.total}</p></div>
        <div className="stat-card"><p className="stat-label">Approved</p><p className="stat-value mt-1 text-emerald-700">{stats.approved}</p></div>
        <div className="stat-card"><p className="stat-label">Pending</p><p className="stat-value mt-1 text-blue-700">{stats.pending}</p></div>
        <div className="stat-card"><p className="stat-label">Renewal Alerts</p><p className={`stat-value mt-1 ${stats.critical > 0 ? "text-red-600" : "text-gray-300"}`}>{stats.critical}</p></div>
      </div>

      

      {/* Two columns: Catalog | License Tracker */}
      <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: License Catalog */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* License Catalog */}
        <section>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search licenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-slate-500 shrink-0" />
            {(["all", "mandatory", "optional", "accreditation"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filterCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalog.map((item) => {
            const tracked = safeLicenses.find((l) => l.type === item.name);
            const applied = !!tracked;
            const isDone = tracked?.status === "approved";
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                    <FileCheck size={20} />
                  </div>
                  <Badge variant={item.isHardGate ? "slate" : "info"}>
                    {CATEGORY_LABELS[item.category]}
                  </Badge>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-2">{item.name}</h3>
                <p className="text-sm text-slate-600 mb-4 flex-1">{item.shortDescription}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key requirements</p>
                  <ul className="space-y-1">
                    {item.keyRequirements.slice(0, 4).map((req, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-slate-500 mb-4">
                  <span className="font-medium">{item.authority}</span>
                  <span className="mx-1">•</span>
                  ~{item.avgApprovalDays} days
                </div>
                <button
                  onClick={() => !applied && setApplyModal(item)}
                  disabled={applied}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
                    isDone
                      ? "bg-emerald-50 text-emerald-700 cursor-default"
                      : applied
                        ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isDone ? (
                    <>
                      <CheckCircle2 size={18} />
                      Done
                    </>
                  ) : applied ? (
                    "Already Applied"
                  ) : (
                    "Apply"
                  )}
                </button>
              </div>
            );
          })}
        </div>
        {filteredCatalog.length === 0 && (
          <p className="text-center py-12 text-slate-500">No licenses match your search or filter.</p>
        )}
        </section>
      </div>

      {/* Right: License Tracker - Static sidebar */}
      <aside className="w-full lg:w-80 shrink-0">
        <div className="sticky top-[25vh]">
          <Card title="License Tracker" icon={FileCheck} className="flex flex-col">
            <div className="overflow-y-auto max-h-[min(60vh,500px)]">
              {safeLicenses.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex p-4 bg-slate-50 rounded-full mb-3">
                    <ShieldAlert size={32} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">No licenses tracked yet.</p>
                  <p className="text-sm text-slate-400">Apply for a license to add it here.</p>
                </div>
              ) : (
                <div className="space-y-4 pr-1">
                  {safeLicenses.map((lic) => {
                    const renewal = getRenewalStatus(lic.renewalDate);
                    const guide = GUIDELINES[lic.type] || { docs: [], templates: [], authority: "—" };
                    const isExpanded = expandedId === lic._id;
                    return (
                      <div
                        key={lic._id}
                        className={`rounded-xl border transition-all ${
                          isExpanded ? "border-blue-200 bg-blue-50/10" : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        <div
                          className="p-4 flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                          onClick={() => toggleExpand(lic._id)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg shrink-0 ${lic.status === "approved" ? "bg-emerald-100 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                              <FileCheck size={18} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-800 text-sm truncate">{lic.type}</h3>
                              <span className="text-xs text-slate-500">{lic.state}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={statusVariant(lic.status)}>
                              {lic.status === "approved" ? "Done" : lic.status}
                            </Badge>
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-0 border-t border-slate-100 space-y-4">
                            {renewal && (
                              <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase ${renewal.bg} ${renewal.color}`}>
                                <Clock size={12} /> {renewal.label}
                              </div>
                            )}
                            {lic.status !== "approved" && (
                              <button
                                onClick={(e) => { e.stopPropagation(); updateLicenseStatus(lic._id, "approved"); }}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                              >
                                <CheckCircle2 size={16} />
                                Mark as Done
                              </button>
                            )}
                            <div>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Documents</h4>
                              <ul className="space-y-1.5">
                                {guide.docs.slice(0, 4).map((doc, i) => (
                                  <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                                    <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                                    <span className="line-clamp-1">{doc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <a
                              href="#"
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink size={14} /> {guide.authority}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </aside>
      </div>
      </div>

      {/* Apply Modal */}
      {applyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">Apply for {applyModal.name}</h3>
              <button onClick={() => setApplyModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">{applyModal.shortDescription}</p>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">State / Region</label>
              <select
                value={applyState}
                onChange={(e) => setApplyState(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setApplyModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => addLicense(applyModal, applyState)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
