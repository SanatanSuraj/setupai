"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Award, Users, Wrench, RefreshCw, Sparkles } from "lucide-react";

const STATIC_INSIGHTS = [
  {
    icon: Wrench,
    tag: "Equipment Tip",
    color: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-800", icon: "text-blue-700" },
    text: "A 5-part Hematology Analyzer covers 80% of test demand for a mid-size lab. Consider shared CAPEX with a nearby collection center.",
  },
  {
    icon: Award,
    tag: "NABL Alert",
    color: { bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-800", icon: "text-amber-700" },
    text: "Quality Policy and Internal Audit Schedule must be finalised at least 6 months before applying for NABL assessment.",
  },
  {
    icon: Users,
    tag: "Staffing Reminder",
    color: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-800", icon: "text-emerald-700" },
    text: "An MD Pathologist must be on-roll before you can apply for NABL or Clinical Establishment registration in most states.",
  },
];

export function AIInsightsCard() {
  const [aiText, setAiText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/roadmap");
      if (res.ok) {
        const data = await res.json();
        if (data.insights && typeof data.insights === "string") {
          setAiText(data.insights);
        }
      }
    } catch {
      // silently fall back to static tips
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    fetchInsights();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show AI insight if available
  if (aiText) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-blue-700">
              <Sparkles size={15} />
              <span className="text-[10px] font-black uppercase tracking-widest">AI Compliance Insight</span>
            </div>
            <button
              onClick={fetchInsights}
              disabled={loading}
              className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
              title="Refresh insights"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <p className="text-sm text-blue-800 font-semibold leading-relaxed whitespace-pre-line">
            {aiText}
          </p>
        </div>

        {/* Always show static tips below AI insight */}
        {STATIC_INSIGHTS.slice(1).map((tip, i) => {
          const Icon = tip.icon;
          return (
            <div
              key={i}
              className={`p-4 ${tip.color.bg} rounded-2xl border ${tip.color.border} relative group overflow-hidden`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon size={15} className={tip.color.icon} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${tip.color.icon}`}>{tip.tag}</span>
              </div>
              <p className={`text-sm ${tip.color.text} font-semibold leading-relaxed`}>{tip.text}</p>
            </div>
          );
        })}
      </div>
    );
  }

  // Loading state
  if (loading && !fetched) {
    return (
      <div className="space-y-3">
        <div className="h-28 bg-blue-50 rounded-2xl border border-blue-100 animate-pulse" />
        <div className="h-20 bg-amber-50 rounded-2xl border border-amber-100 animate-pulse" />
        <div className="h-20 bg-emerald-50 rounded-2xl border border-emerald-100 animate-pulse" />
      </div>
    );
  }

  // Fallback: static tips (when AI not available)
  return (
    <div className="space-y-3">
      {STATIC_INSIGHTS.map((tip, i) => {
        const Icon = tip.icon;
        return (
          <div
            key={i}
            className={`p-4 ${tip.color.bg} rounded-2xl border ${tip.color.border} relative group overflow-hidden`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon size={15} className={tip.color.icon} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${tip.color.icon}`}>{tip.tag}</span>
              </div>
              <p className={`text-sm ${tip.color.text} font-semibold leading-relaxed`}>{tip.text}</p>
            </div>
            <div className="absolute right-2 top-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <Icon size={56} />
            </div>
          </div>
        );
      })}
      <div className="flex items-center gap-2">
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="text-xs font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading AI insights…" : "Load AI insights"}
        </button>
      </div>
    </div>
  );
}
