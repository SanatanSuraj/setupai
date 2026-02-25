"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import { Download, Plus, Package, Microscope, Users, Cpu, Layers, ShieldCheck, Wrench, Zap } from "lucide-react";

interface EquipmentItem {
  _id: string;
  name: string;
  category: string;
  capex: number;
  maintenanceCost?: number;
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

  const addEquipment = async (rec: Recommendation) => {
    const res = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: rec.name,
        category: rec.category,
        capex: rec.estimatedCapex,
      }),
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
      <div className="p-6 md:p-8">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Equipment & Infrastructure</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">Test-menu based procurement and ROI tracking</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
            <Download size={18} /> Export List
          </button>
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>
      

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Procurement Status">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-2xl font-black text-slate-900">₹{(budgetSpent / 100000).toFixed(2)} L</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Budget Spent</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">{procuredPct}%</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Procured</p>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-[65%]" />
            </div>
          </div>
        </Card>
        <Card title="Pending Calibration">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <Wrench size={24} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">03</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">Items requiring validation before launch</p>
            </div>
          </div>
        </Card>
        <Card title="Power Load">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Zap size={24} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">12.5 KW</p>
              <p className="text-xs text-slate-500 font-medium leading-tight">Total Estimated Operational Load</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold text-foreground">Recommend by test menu</h2>
        <p className="mt-1 text-sm text-muted-foreground">Enter comma-separated tests (e.g. CBC, Sugar, Creatinine).</p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={testMenu}
            onChange={(e) => setTestMenu(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2"
            placeholder="CBC, Sugar, Creatinine"
          />
          <button onClick={getRecommendations} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
            Get recommendations
          </button>
        </div>
      </div>
      {showRecommend && recommendations.length > 0 && (
        <Card title="AI recommendations">
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 p-4">
                <div>
                  <h3 className="font-medium text-foreground">{rec.name}</h3>
                  <p className="text-sm text-muted-foreground">{rec.category} · ₹{rec.estimatedCapex.toLocaleString()} CAPEX</p>
                </div>
                <button onClick={() => addEquipment(rec)} className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20">
                  Add to list
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
            <Card title="Your equipment list">
        <p className="text-sm text-muted-foreground">Total CAPEX: ₹{totalCapex.toLocaleString()}</p>
        <ul className="mt-4 space-y-2">
          {equipment.length === 0 && <p className="text-muted-foreground">No equipment added yet.</p>}
          {equipment.map((e) => (
            <li key={e._id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
              <div>
                <span className="font-medium text-foreground">{e.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">{e.category}</span>
              </div>
              <span className="font-medium text-foreground">₹{e.capex.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {CATEGORIES.map((cat, idx) => (
            <Card key={idx} title={cat.name} icon={cat.icon}>
              <div className="space-y-4">
                {cat.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-blue-200 hover:bg-blue-50/20 transition-all group">
                    <div className="flex gap-4">
                      <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-white transition-colors">
                        <Package size={20} className="text-slate-400 group-hover:text-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium">{item.detail}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant={item.status === "Procured" ? "success" : item.status === "Ordered" ? "warning" : "slate"}>{item.status}</Badge>
                          <span className="text-[10px] text-slate-400 font-bold italic">Est. ROI: {item.roi}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 text-left sm:text-right border-t sm:border-none pt-3 sm:pt-0">
                      <p className="text-sm font-black text-slate-900">{item.price}</p>
                      <button className="text-[10px] font-bold text-blue-600 hover:underline">View Quotes →</button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card title="Vendor Marketplace" icon={Layers}>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed font-medium">
              We&apos;ve pre-negotiated rates with these vendors for MobiLab partners.
            </p>
            <div className="space-y-3">
              {VENDORS.map((vendor, vIdx) => (
                <div key={vIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 cursor-pointer group transition-all">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-800">{vendor.name}</p>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">-{vendor.discount}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">{vendor.type}</p>
                </div>
              ))}
              <button className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                Compare All Vendors
              </button>
            </div>
          </Card>

          <Card title="Patho.ai Insight" icon={ShieldCheck}>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-[11px] font-bold text-blue-800 leading-tight">
                Based on your 200 sq ft layout, a Benchtop Fully-Auto Analyzer is recommended over a Floor-standing model to optimize workflow efficiency by 22%.
              </p>
              <button className="mt-3 text-[10px] font-black text-blue-600 uppercase hover:underline">
                Read Optimized Layout Guide
              </button>
            </div>
          </Card>
        </div>
      </div>


    </div>
  );
}
