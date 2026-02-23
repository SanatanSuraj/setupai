"use client";

import { useEffect, useState } from "react";

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

  if (loading) return <div className="p-6 md:p-8"><p className="text-muted-foreground">Loading…</p></div>;

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground">Equipment Planner</h1>
      <p className="mt-1 text-muted-foreground">Test menu selection, equipment recommendations, CAPEX calculator.</p>
      <div className="mt-6 rounded-xl border border-border bg-card p-4">
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
          <button
            onClick={getRecommendations}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Get recommendations
          </button>
        </div>
      </div>
      {showRecommend && recommendations.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-foreground">AI recommendations</h2>
          <div className="mt-3 space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <h3 className="font-medium text-foreground">{rec.name}</h3>
                  <p className="text-sm text-muted-foreground">{rec.category} · ₹{rec.estimatedCapex.toLocaleString()} CAPEX</p>
                  <p className="text-xs text-muted-foreground">
                    Vendors: {rec.vendors.map((v) => `${v.name} (₹${v.priceRange[0].toLocaleString()}-${v.priceRange[1].toLocaleString()})`).join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => addEquipment(rec)}
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
                >
                  Add to list
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-8">
        <h2 className="font-semibold text-foreground">Your equipment list</h2>
        <p className="mt-1 text-sm text-muted-foreground">Total CAPEX: ₹{totalCapex.toLocaleString()}</p>
        <ul className="mt-4 space-y-2">
          {equipment.length === 0 && <p className="text-muted-foreground">No equipment added yet.</p>}
          {equipment.map((e) => (
            <li
              key={e._id}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div>
                <span className="font-medium text-foreground">{e.name}</span>
                <span className="ml-2 text-sm text-muted-foreground">{e.category}</span>
              </div>
              <span className="font-medium text-foreground">₹{e.capex.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
