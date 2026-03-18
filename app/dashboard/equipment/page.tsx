"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { Download, Plus, Package, Microscope, Users, Cpu, Layers, ShieldCheck, Wrench, Zap, TrendingUp, X } from "lucide-react";

type EquipmentStatus = "planning" | "ordered" | "delivered" | "installed" | "integrated";

const STATUS_STEPS: EquipmentStatus[] = ["planning", "ordered", "delivered", "installed", "integrated"];
const STATUS_COLORS: Record<EquipmentStatus, string> = {
  planning:   "bg-slate-100 text-slate-600",
  ordered:    "bg-blue-100 text-blue-700",
  delivered:  "bg-amber-100 text-amber-700",
  installed:  "bg-violet-100 text-violet-700",
  integrated: "bg-emerald-100 text-emerald-700",
};

interface EquipmentItem {
  _id: string;
  name: string;
  category: string;
  capex: number;
  maintenanceCost?: number;
  status?: EquipmentStatus;
}

interface Recommendation {
  name: string;
  category: string;
  estimatedCapex: number;
  vendors: { name: string; priceRange: [number, number] }[];
}

const CATEGORIES = [
  {
    name: "Core Analyzers",
    icon: Microscope,
    items: [
      { name: "3-Part Hematology Analyzer", detail: "Sysmex / Mindray - 22 Parameters", price: "₹2.8L - ₹4.5L", status: "Ordered", roi: "14 Mo" },
      { name: "Semi-Auto Biochemistry Analyzer", detail: "Erba / Transasia - Lipid, LFT, KFT", price: "₹1.2L - ₹2.5L", status: "Procured", roi: "10 Mo" },
      { name: "HbA1c Analyzer (HPLC/Boronate)", detail: "Diabetes & Anemia focus", price: "₹3.5L - ₹6.0L", status: "Pending", roi: "18 Mo" },
    ],
  },
  {
    name: "Phlebotomy & Collection",
    icon: Users,
    items: [
      { name: "Phlebotomy Recliner Chairs", detail: "Ergonomic, High-Grade Vinyl", price: "₹15k - ₹25k", status: "Procured", roi: "N/A" },
      { name: "Needle Destroyer / Hub Cutter", detail: "Electric / Manual (BMW compliant)", price: "₹2k - ₹5k", status: "Procured", roi: "N/A" },
      { name: "Sample Vacutainer Set", detail: "EDTA, Citrate, SST (Bulk Pack)", price: "₹5k - ₹8k", status: "Ordered", roi: "N/A" },
    ],
  },
  {
    name: "Lab Essentials",
    icon: Package,
    items: [
      { name: "Medical Grade Refrigerator", detail: "2-8°C with digital logger", price: "₹45k - ₹85k", status: "Procured", roi: "N/A" },
      { name: "Digital Centrifuge", detail: "Remi - 4000 RPM (Timer & Brake)", price: "₹18k - ₹35k", status: "Procured", roi: "8 Mo" },
      { name: "Deep Freezer (-20°C)", detail: "Long term reagent storage", price: "₹35k - ₹55k", status: "Pending", roi: "N/A" },
    ],
  },
  {
    name: "IT & Infrastructure",
    icon: Cpu,
    items: [
      { name: "LIMS Cloud Server + Workstations", detail: "3 Terminals with Barcode Scanners", price: "₹1.5L - ₹2.5L", status: "Ordered", roi: "24 Mo" },
      { name: "Online UPS Backup (5-10 KVA)", detail: "2-Hour full load backup", price: "₹85k - ₹1.5L", status: "Pending", roi: "N/A" },
      { name: "RO Water Treatment Plant", detail: "For chemistry reagent preparation", price: "₹25k - ₹45k", status: "Procured", roi: "N/A" },
    ],
  },
];

const VENDORS = [
  { name: "Mobilab", type: "Biochemistry, Hematology", discount: "50%" },
  { name: "Sysmex India", type: "Hematology", discount: "15%" },
  { name: "Transasia Bio", type: "Chemistry", discount: "10%" },
  { name: "Remi Electrotechnik", type: "Essentials", discount: "12%" },
  { name: "Mindray Medical", type: "All-Round", discount: "18%" },
];

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [testMenu, setTestMenu] = useState("CBC, Sugar, Creatinine");
  const [showRecommend, setShowRecommend] = useState(false);

  useEffect(() => {
    fetch("/api/equipment")
      .then((r) => r.json())
      .then(setEquipment)
      .finally(() => setLoading(false));
  }, []);

  const getRecommendations = async () => {
    const list = testMenu.split(",").map((s) => s.trim()).filter(Boolean);
    const res = await fetch("/api/equipment/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testMenu: list }),
    });
    if (res.ok) {
      const data = await res.json();
      setRecommendations(data);
      setShowRecommend(true);
    }
  };

  const updateEquipmentStatus = async (id: string, status: EquipmentStatus) => {
    const res = await fetch(`/api/equipment/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const json = await res.json();
      const updated = json.data ?? json;
      setEquipment((prev) => prev.map((e) => (e._id === id ? { ...e, ...updated } : e)));
    }
  };

  const deleteEquipment = async (id: string) => {
    const res = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
    if (res.ok) setEquipment((prev) => prev.filter((e) => e._id !== id));
  };

  const addEquipment = async (rec: Recommendation) => {
    const res = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: rec.name, category: rec.category, capex: rec.estimatedCapex }),
    });
    if (res.ok) {
      const newItem = await res.json();
      setEquipment((prev) => [newItem, ...prev]);
    }
  };

  const totalCapex = equipment.reduce((s, e) => s + e.capex, 0);
  const budgetSpent = 842000;
  const procuredPct = 65;

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-4">
        <div className="h-48 rounded-2xl skeleton" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="h-24 rounded-xl skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8 animate-fade-in-up">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">
            <Wrench size={17} className="text-violet-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Equipment &amp; Infrastructure</h1>
            <p className="text-sm text-gray-500 mt-0.5">Test-menu based procurement and ROI tracking</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="btn-secondary btn-sm">
            <Download size={13} /> Export
          </button>
          <button className="btn-primary btn-sm">
            <Plus size={13} /> Add Item
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Budget Spent",        value: `₹${(budgetSpent/100000).toFixed(1)}L`, accent: "violet" },
          { label: "Procured",             value: `${procuredPct}%`,                       accent: "green" },
          { label: "Pending Calibration",  value: "3",                                     accent: "amber" },
          { label: "Power Load",           value: "12.5 KW",                               accent: "slate" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card title="Procurement Status">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-black text-slate-900">₹{(budgetSpent / 100000).toFixed(2)}L</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Budget Spent</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{procuredPct}%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Procured</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${procuredPct}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Pending Calibration" icon={Wrench}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 border border-amber-100">
              <Wrench size={22} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">03</p>
              <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">Items requiring validation before launch</p>
            </div>
          </div>
        </Card>

        <Card title="Power Load" icon={Zap}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 border border-blue-100">
              <Zap size={22} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">12.5 <span className="text-sm font-bold text-slate-500">KW</span></p>
              <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">Total Estimated Operational Load</p>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Recommend */}
      <Card title="AI Equipment Recommendations" subtitle="Enter your test menu to get AI-powered equipment suggestions" icon={TrendingUp}>
        <div className="flex gap-2">
          <input
            type="text"
            value={testMenu}
            onChange={(e) => setTestMenu(e.target.value)}
            className="input-base flex-1"
            placeholder="CBC, Sugar, Creatinine"
          />
          <button onClick={getRecommendations} className="btn-primary whitespace-nowrap">
            Get Recommendations
          </button>
        </div>
      </Card>

      {showRecommend && recommendations.length > 0 && (
        <Card title="AI Recommendations" icon={TrendingUp}>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{rec.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{rec.category} · ₹{rec.estimatedCapex.toLocaleString()} CAPEX</p>
                </div>
                <button onClick={() => addEquipment(rec)} className="px-3 py-1.5 rounded-lg bg-blue-50 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors">
                  + Add to list
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Equipment list */}
      <Card title="Your Equipment List" subtitle="Track procurement lifecycle per item" icon={Package}>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">Total CAPEX: <span className="font-bold text-slate-800">₹{totalCapex.toLocaleString()}</span></p>
          <p className="text-xs text-slate-400">{equipment.length} item{equipment.length !== 1 ? "s" : ""}</p>
        </div>
        {equipment.length === 0 ? (
          <div className="py-10 text-center">
            <Package size={32} className="text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No equipment added yet.</p>
            <p className="text-slate-400 text-xs mt-1">Use AI recommendations above to add items.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {equipment.map((e) => {
              const currentStatus = (e.status ?? "planning") as EquipmentStatus;
              const currentIdx = STATUS_STEPS.indexOf(currentStatus);
              return (
                <div key={e._id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{e.name}</p>
                      <p className="text-xs text-slate-500">{e.category} · ₹{e.capex.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold capitalize ${STATUS_COLORS[currentStatus]}`}>
                        {currentStatus}
                      </span>
                      <button
                        onClick={() => deleteEquipment(e._id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="Remove"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {STATUS_STEPS.map((step, idx) => {
                      const isPast = idx < currentIdx;
                      const isCurrent = idx === currentIdx;
                      const isNext = idx === currentIdx + 1;
                      return (
                        <button
                          key={step}
                          onClick={() => isNext ? updateEquipmentStatus(e._id, step) : undefined}
                          disabled={!isNext}
                          title={isNext ? `Advance to "${step}"` : step}
                          className={`flex-1 h-1.5 rounded-full transition-all ${
                            isPast || isCurrent
                              ? "bg-blue-500"
                              : isNext
                                ? "bg-slate-200 hover:bg-blue-300 cursor-pointer"
                                : "bg-slate-100 cursor-default"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    {STATUS_STEPS.map((step) => (
                      <span key={step} className={`capitalize ${step === currentStatus ? "text-blue-600 font-bold" : ""}`}>{step}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Categories + Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-5">
          {CATEGORIES.map((cat, idx) => (
            <Card key={idx} title={cat.name} icon={cat.icon}>
              <div className="space-y-3">
                {cat.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-blue-200 hover:bg-blue-50/20 transition-all group">
                    <div className="flex gap-3">
                      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white transition-colors border border-slate-100">
                        <Package size={18} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{item.detail}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge variant={item.status === "Procured" ? "success" : item.status === "Ordered" ? "warning" : "slate"}>
                            {item.status}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-bold italic">Est. ROI: {item.roi}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 text-left sm:text-right border-t sm:border-none pt-3 sm:pt-0">
                      <p className="text-sm font-black text-slate-900">{item.price}</p>
                      <button className="text-[10px] font-bold text-blue-600 hover:underline mt-0.5">View Quotes →</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-5">
          <Card title="Vendor Marketplace" icon={Layers}>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Pre-negotiated rates with these vendors for MobiLab partners.
            </p>
            <div className="space-y-2">
              {VENDORS.map((vendor, vIdx) => (
                <div key={vIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 cursor-pointer group transition-all">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">{vendor.name}</p>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-lg">-{vendor.discount}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">{vendor.type}</p>
                </div>
              ))}
              <button className="w-full mt-3 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                Compare All Vendors
              </button>
            </div>
          </Card>

          <Card title="AI Insight" icon={ShieldCheck}>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-800 leading-relaxed">
                Based on your 200 sq ft layout, a Benchtop Fully-Auto Analyzer is recommended to optimize workflow efficiency by 22%.
              </p>
              <button className="mt-3 text-[10px] font-bold text-blue-600 uppercase hover:underline">
                Read Optimized Layout Guide →
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
