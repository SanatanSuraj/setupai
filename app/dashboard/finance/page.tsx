"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface FinancialModel {
  capex: number;
  opex: number;
  revenueProjection: number[];
  breakEvenMonths: number;
}

export default function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [capex, setCapex] = useState("0");
  const [opex, setOpex] = useState("0");
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
    const res = await fetch("/api/finance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        capex: c,
        opex: o,
        revenueProjection,
        breakEvenMonths,
      }),
    });
    if (res.ok) void res.json();
  };

  const c = parseInt(capex, 10) || 0;
  const o = parseInt(opex, 10) || 0;
  const rev = parseInt(monthlyRevenue, 10) || 0;
  const monthlyProfit = rev - o;
  const breakEvenMonths = monthlyProfit <= 0 ? 0 : Math.ceil(c / monthlyProfit);
  const chartData = [
    { name: "CAPEX", value: c },
    { name: "OPEX (monthly)", value: o },
    { name: "Revenue (monthly)", value: rev },
  ].filter((d) => d.value > 0);
  const projectionData = Array.from({ length: Math.min(12, breakEvenMonths + 6) }, (_, i) => ({
    month: `M${i + 1}`,
    cumulativeRevenue: rev * (i + 1),
    breakEven: i + 1 >= breakEvenMonths ? c : null,
  }));

  if (loading) return <div className="p-6 md:p-8"><p className="text-muted-foreground">Loading…</p></div>;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground">Financial Planning</h1>
      <p className="mt-1 text-muted-foreground">CAPEX, OPEX, revenue projection, break-even.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="block text-sm font-medium text-foreground">CAPEX (₹)</label>
          <input
            type="number"
            value={capex}
            onChange={(e) => setCapex(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="block text-sm font-medium text-foreground">OPEX / month (₹)</label>
          <input
            type="number"
            value={opex}
            onChange={(e) => setOpex(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <label className="block text-sm font-medium text-foreground">Expected monthly revenue (₹)</label>
          <input
            type="number"
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
      </div>
      <button
        onClick={saveModel}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        Update model
      </button>
      <div className="mt-8 flex flex-wrap gap-4">
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Break-even (months)</span>
          <p className="text-2xl font-bold text-primary">{breakEvenMonths}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-sm text-muted-foreground">Monthly profit (est.)</span>
          <p className="text-2xl font-bold text-foreground">₹{monthlyProfit.toLocaleString()}</p>
        </div>
      </div>
      {chartData.length > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold text-foreground">CAPEX vs OPEX vs Revenue</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip formatter={(v: number | undefined) => (v != null ? `₹${v.toLocaleString()}` : "")} />
                <Bar dataKey="value" fill="var(--primary)" name="Amount (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {projectionData.length > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card p-4">
          <h2 className="font-semibold text-foreground">Revenue projection & break-even</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip formatter={(v: number | undefined) => (v != null ? `₹${v.toLocaleString()}` : "")} />
                <Line type="monotone" dataKey="cumulativeRevenue" stroke="var(--accent)" strokeWidth={2} name="Cumulative revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Break-even at month {breakEvenMonths} (₹{c.toLocaleString()} CAPEX).</p>
        </div>
      )}
    </div>
  );
}
