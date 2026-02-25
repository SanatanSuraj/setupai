"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import {
  Download,
  Plus,
  Wallet,
  PieChart,
  TrendingUp,
  Clock,
  BarChart3,
  Package,
  ShieldCheck,
  Activity,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface FinancialModel {
  capex: number;
  opex: number;
  revenueProjection: number[];
  breakEvenMonths: number;
}

const CAPEX_ITEMS = [
  { label: "Laboratory Equipment", val: "₹8,50,000", status: "Allocated" },
  { label: "Infrastructure & Interior", val: "₹2,50,000", status: "Pending" },
  { label: "Legal & Licensing Fees", val: "₹85,000", status: "Allocated" },
  { label: "Initial Marketing Buffer", val: "₹1,00,000", status: "Pending" },
];

const OPEX_MONTHLY = [
  { label: "Staff Salaries", val: "₹1,80,000" },
  { label: "Rent & Utilities", val: "₹45,000" },
  { label: "Reagents & Consumables", val: "₹65,000" },
  { label: "Logistics & Waste Management", val: "₹12,000" },
];

const REAGENTS = [
  { name: "Hematology Lyse (5L)", stock: "15%", status: "Critical", trend: "Up" },
  { name: "Biochem Multicalibrator", stock: "45%", status: "Stable", trend: "Flat" },
  { name: "EDTA Vacutainers (K3)", stock: "8%", status: "Reorder", trend: "Up" },
  { name: "Isoton III Diluent", stock: "60%", status: "Stable", trend: "Down" },
];

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [capex, setCapex] = useState("1285000");
  const [opex, setOpex] = useState("302000");
  const [monthlyRevenue, setMonthlyRevenue] = useState("100000");

  useEffect(() => {
    fetch("/api/finance")
      .then((r) => r.json())
      .then((data: FinancialModel | null) => {
        if (data?.capex != null) setCapex(String(data.capex));
        if (data?.opex != null) setOpex(String(data.opex));
      })
      .finally(() => setLoading(false));
  }, []);

  const saveModel = async () => {
    const c = parseInt(capex, 10) || 0;
    const o = parseInt(opex, 10) || 0;
    const rev = parseInt(monthlyRevenue, 10) || 0;
    const monthlyProfit = rev - o;
    const breakEvenMonths = monthlyProfit <= 0 ? 0 : Math.ceil(c / monthlyProfit);
    const revenueProjection = Array.from({ length: 24 }, (_, i) => rev * (i + 1));
    await fetch("/api/finance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capex: c,
        opex: o,
        revenueProjection,
        breakEvenMonths,
      }),
    });
  };

  const c = parseInt(capex, 10) || 1285000;
  const o = parseInt(opex, 10) || 302000;
  const rev = parseInt(monthlyRevenue, 10) || 100000;
  const monthlyProfit = rev - o;
  const breakEvenMonths = monthlyProfit <= 0 ? 0 : Math.ceil(c / monthlyProfit);
  const barHeights = [35, 45, 65, 80, 75, 95, 110, 130];

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
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Financial Planning Module</h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">CAPEX/OPEX Modeling powered by Train.ai forecasting</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2">
            <Download size={18} /> Budget Report
          </button>
          <button className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all active:scale-95">
            <Plus size={18} /> Add Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total CAPEX Est.", val: `₹${(c / 100000).toFixed(2)} L`, icon: Wallet, color: "blue" },
          { label: "Monthly OPEX Est.", val: `₹${(o / 100000).toFixed(2)} L`, icon: PieChart, color: "purple" },
          { label: "Avg. Test Revenue", val: "₹650", icon: TrendingUp, color: "emerald" },
          { label: "Break-even Target", val: `Month ${breakEvenMonths}`, icon: Clock, color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color === "blue" ? "bg-blue-50 text-blue-600" : stat.color === "purple" ? "bg-purple-50 text-purple-600" : stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-slate-900">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Revenue & Growth Projection" icon={BarChart3} action={<Badge variant="purple">Train.ai Forecasting</Badge>}>
            <div className="h-48 flex items-end justify-between gap-2 px-2 border-b border-slate-100 pb-4">
              {barHeights.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-blue-100 rounded-t-lg transition-all group-hover:bg-blue-600 relative" style={{ height: `${h}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ₹{(h * 5000).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">M{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Growth Drivers</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">Health Packages</span>
                    <span className="text-emerald-600">+12%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">Corporate Tie-ups</span>
                    <span className="text-emerald-600">+8%</span>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Break-even Tracker</p>
                <p className="text-sm font-bold text-slate-800">₹{(c * 0.65).toLocaleString()} Recovery Pending</p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[35%]" />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="CAPEX Breakdown" subtitle="Initial Setup Cost">
              <div className="space-y-4">
                {CAPEX_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    <span className="text-xs font-black text-slate-900">{item.val}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase">Total</span>
                  <span className="text-sm font-black text-blue-600">₹12,85,000</span>
                </div>
              </div>
            </Card>
            <Card title="Monthly OPEX" subtitle="Recurring Operational Costs">
              <div className="space-y-4">
                {OPEX_MONTHLY.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                    <span className="text-xs font-bold text-slate-600">{item.label}</span>
                    <span className="text-xs font-black text-slate-900">{item.val}</span>
                  </div>
                ))}
                <div className="pt-2 flex justify-between">
                  <span className="text-xs font-black text-slate-400 uppercase">Total</span>
                  <span className="text-sm font-black text-purple-600">₹3,02,000</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Consumables & Reagents" icon={Package}>
            <div className="space-y-5">
              {REAGENTS.map((r, i) => (
                <div key={i} className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-700">{r.name}</p>
                    <Badge variant={r.status === "Critical" ? "danger" : r.status === "Reorder" ? "warning" : "success"}>
                      {r.stock}
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${parseInt(r.stock) < 20 ? "bg-rose-500" : parseInt(r.stock) < 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: r.stock }}
                    />
                  </div>
                  {parseInt(r.stock) < 20 && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest animate-pulse">
                      <AlertCircle size={10} /> Auto-Reorder Triggered
                    </div>
                  )}
                </div>
              ))}
              <button className="w-full mt-4 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 flex items-center justify-center gap-2 transition-all">
                <RefreshCw size={14} /> Sync Inventory with LIMS
              </button>
            </div>
          </Card>

          <Card title="Train.ai Smart Insight" icon={ShieldCheck}>
            <div className="p-5 bg-blue-600 rounded-[2rem] text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 text-blue-200">
                  <Activity size={18} />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em]">Margin Optimizer</span>
                </div>
                <p className="text-sm font-bold leading-relaxed">
                  Train.ai predicts a high demand for Lipid Profiles in your zone. Increasing package price by 15% during Senior Citizen camps could improve Month 3 margins by ₹42,000.
                </p>
                <button className="mt-4 w-full py-2 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors">
                  Implement Strategy
                </button>
              </div>
              <div className="absolute -bottom-6 -right-6 text-white/10 group-hover:text-white/20 transition-colors transform rotate-12">
                <TrendingUp size={140} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
