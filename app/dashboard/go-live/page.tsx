"use client";

import { useEffect, useMemo, useState } from "react";
import { StatCard } from "@/components/dashboard/Card";
import { Badge } from "@/components/dashboard/Badge";
import {
  Rocket,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ListChecks,
  ShieldCheck,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  SECTIONS,
  ALL_ITEMS,
  purgeLegacyLocalState,
  type ChecklistItem,
  type GateStatus,
  type Section,
} from "@/lib/go-live-checklist";

type GoLiveGate = {
  _id: string;
  name: string;
  gateType: string;
  status: GateStatus;
  isHardGate: boolean;
  blockingReason?: string;
  actionRequired?: string;
};

type ReadinessResponse = {
  canGoLive: boolean;
  gates?: { goLive?: GoLiveGate[] };
};


const accentBg: Record<Section["accent"], string> = {
  blue:   "bg-blue-100 text-blue-600",
  violet: "bg-violet-100 text-violet-600",
  amber:  "bg-amber-100 text-amber-600",
  green:  "bg-green-100 text-green-600",
  red:    "bg-red-100 text-red-600",
  slate:  "bg-gray-100 text-gray-600",
  indigo: "bg-indigo-100 text-indigo-600",
  orange: "bg-orange-100 text-orange-600",
};

const accentBar: Record<Section["accent"], string> = {
  blue:   "bg-blue-500",
  violet: "bg-violet-500",
  amber:  "bg-amber-500",
  green:  "bg-green-500",
  red:    "bg-red-500",
  slate:  "bg-gray-400",
  indigo: "bg-indigo-500",
  orange: "bg-orange-500",
};

export default function GoLivePage() {
  const [data, setData] = useState<ReadinessResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  /* On first mount, clear any legacy localStorage from the previous version. */
  useEffect(() => {
    purgeLegacyLocalState();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [readinessRes, checklistRes] = await Promise.all([
        fetch("/api/compliance/readiness", { cache: "no-store" }),
        fetch("/api/go-live/checklist", { cache: "no-store" }),
      ]);
      if (!readinessRes.ok) throw new Error(`Failed to load readiness (${readinessRes.status})`);
      const readinessJson = (await readinessRes.json()) as ReadinessResponse;
      setData(readinessJson);

      if (checklistRes.ok) {
        const checklistJson = (await checklistRes.json()) as { checks?: Record<string, boolean> };
        setChecks(checklistJson.checks ?? {});
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load readiness");
    } finally {
      setLoading(false);
    }
  }

  async function seed() {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/compliance/readiness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`Failed to initialize gates (${res.status})`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to initialize gates");
    } finally {
      setSeeding(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* Map gateType → DB gate for quick lookup. */
  const dbGatesByType = useMemo(() => {
    const map: Record<string, GoLiveGate> = {};
    for (const g of data?.gates?.goLive ?? []) {
      map[g.gateType] = g;
    }
    return map;
  }, [data]);

  async function toggleItem(itemId: string) {
    const next = !checks[itemId];
    /* Optimistic update */
    setChecks((p) => ({ ...p, [itemId]: next }));
    try {
      const res = await fetch("/api/go-live/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, checked: next }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
    } catch (e) {
      /* Roll back on failure */
      setChecks((p) => ({ ...p, [itemId]: !next }));
      setError(e instanceof Error ? e.message : "Failed to save check");
    }
  }

  function itemStatus(item: ChecklistItem): GateStatus {
    if (item.gateType && dbGatesByType[item.gateType]) {
      return dbGatesByType[item.gateType].status;
    }
    return checks[item.id] ? "passed" : "pending";
  }

  /* Aggregates across all sections. */
  const totalItems = ALL_ITEMS.length;
  const completedItems = useMemo(
    () => ALL_ITEMS.filter((i) => itemStatus(i) === "passed").length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbGatesByType, checks],
  );
  const overallPct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  /* Critical blockers = hard items not yet passed. */
  const blockers = useMemo(
    () => ALL_ITEMS.filter((i) => i.hardGate && itemStatus(i) !== "passed"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbGatesByType, checks],
  );
  const hardItems = useMemo(() => ALL_ITEMS.filter((i) => i.hardGate), []);
  const canGoLive = blockers.length === 0;

  const noDbGates = (data?.gates?.goLive?.length ?? 0) === 0;

  /* ─── Render ─────────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 p-6 md:p-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600">
            <Rocket size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
              Go Live Checklist
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              A 25-year lab-consultant playbook — every gate, in 9 sections.
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {noDbGates && !loading && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-start gap-2 flex-1">
            <ListChecks size={16} className="text-orange-600 mt-0.5" />
            <p className="text-sm text-orange-900">
              <span className="font-semibold">Tracked gates not initialised.</span>{" "}
              Seed the 12 standard go-live gates so their status is auto-tracked
              from the database. The full checklist below works regardless.
            </p>
          </div>
          <button
            onClick={seed}
            disabled={seeding}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 disabled:opacity-60 shrink-0"
          >
            {seeding ? <Loader2 size={13} className="animate-spin" /> : null}
            Initialise gates
          </button>
        </div>
      )}

      {/* Status banner */}
      <div
        className={`rounded-xl border px-5 py-4 flex items-center gap-4 ${
          canGoLive
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            canGoLive ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
          }`}
        >
          {canGoLive ? <Rocket size={18} /> : <AlertTriangle size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${canGoLive ? "text-emerald-900" : "text-amber-900"}`}>
            {canGoLive
              ? "Ready to launch"
              : `${blockers.length} hard-gate item${blockers.length === 1 ? "" : "s"} pending`}
          </p>
          <p className={`text-xs mt-0.5 ${canGoLive ? "text-emerald-700" : "text-amber-700"}`}>
            {canGoLive
              ? "Every hard gate is passed. You can open the lab."
              : "Resolve every hard-gate item below before opening day."}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold tracking-tight text-gray-900">{overallPct}%</p>
          <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Complete</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Items Complete"
          value={`${completedItems} / ${totalItems}`}
          icon={CheckCircle2}
          accent="green"
        />
        <StatCard
          label="Hard Gates"
          value={hardItems.length}
          sub={`${hardItems.filter((i) => itemStatus(i) === "passed").length} passed`}
          icon={ShieldCheck}
          accent="blue"
        />
        <StatCard
          label="Critical Blockers"
          value={blockers.length}
          icon={AlertTriangle}
          accent={blockers.length > 0 ? "red" : "slate"}
        />
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {SECTIONS.map((section) => {
          const sectionItems = section.items;
          const sectionPassed = sectionItems.filter((i) => itemStatus(i) === "passed").length;
          const sectionTotal = sectionItems.length;
          const sectionPct = sectionTotal > 0 ? Math.round((sectionPassed / sectionTotal) * 100) : 0;
          const isOpen = openSections[section.id] ?? false;
          const Icon = section.icon;

          return (
            <div
              key={section.id}
              className="rounded-xl border border-gray-100 bg-white shadow-card overflow-hidden"
            >
              <button
                onClick={() => setOpenSections((p) => ({ ...p, [section.id]: !isOpen }))}
                className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${accentBg[section.accent]}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {sectionPassed} / {sectionTotal}
                  </p>
                  <div className="mt-1 h-1.5 w-24 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full ${accentBar[section.accent]} transition-all`}
                      style={{ width: `${sectionPct}%` }}
                    />
                  </div>
                </div>
                {isOpen ? (
                  <ChevronDown size={16} className="text-gray-400 shrink-0" />
                ) : (
                  <ChevronRight size={16} className="text-gray-400 shrink-0" />
                )}
              </button>

              {isOpen && (
                <ul className="divide-y divide-gray-100 border-t border-gray-100">
                  {sectionItems.map((item) => {
                    const status = itemStatus(item);
                    const isDb = !!item.gateType && !!dbGatesByType[item.gateType];
                    const passed = status === "passed";
                    return (
                      <li
                        key={item.id}
                        className="px-5 py-3.5 flex items-start gap-3 hover:bg-gray-50/50 transition-colors"
                      >
                        <button
                          onClick={() => !isDb && toggleItem(item.id)}
                          disabled={isDb}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                            passed
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "bg-white border-gray-300 hover:border-gray-400"
                          } ${isDb ? "cursor-default" : "cursor-pointer"}`}
                          title={isDb ? "Status synced from server" : "Click to toggle"}
                        >
                          {passed && <CheckCircle2 size={13} />}
                          {!passed && status === "failed" && <XCircle size={13} className="text-red-500" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-medium ${passed ? "text-gray-400 line-through" : "text-gray-900"}`}>
                              {item.title}
                            </p>
                            {item.hardGate && (
                              <Badge variant="danger" size="sm">Hard Gate</Badge>
                            )}
                            {isDb && (
                              <Badge variant="info" size="sm">Tracked</Badge>
                            )}
                          </div>
                          {item.detail && (
                            <p className={`text-xs mt-0.5 ${passed ? "text-gray-400" : "text-gray-500"}`}>
                              {item.detail}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
