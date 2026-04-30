"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Rocket, AlertTriangle, ArrowRight } from "lucide-react";
import {
  ALL_ITEMS,
  purgeLegacyLocalState,
  type ChecklistItem,
  type GateStatus,
} from "@/lib/go-live-checklist";

type GoLiveGate = {
  _id: string;
  gateType: string;
  status: GateStatus;
};

type ReadinessResponse = {
  gates?: { goLive?: GoLiveGate[] };
};

export function GoLiveStatusCard() {
  const [data, setData] = useState<ReadinessResponse | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    purgeLegacyLocalState();

    let cancelled = false;
    async function load() {
      try {
        const [readinessRes, checklistRes] = await Promise.all([
          fetch("/api/compliance/readiness", { cache: "no-store" }),
          fetch("/api/go-live/checklist", { cache: "no-store" }),
        ]);
        if (!cancelled && readinessRes.ok) {
          setData((await readinessRes.json()) as ReadinessResponse);
        }
        if (!cancelled && checklistRes.ok) {
          const j = (await checklistRes.json()) as { checks?: Record<string, boolean> };
          setChecks(j.checks ?? {});
        }
      } catch {
        /* fail quietly — banner still renders with whatever it has */
      }
    }
    load();

    /* Refresh when the tab regains focus so cross-tab edits show up. */
    function onVisible() {
      if (document.visibilityState === "visible") load();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const dbGatesByType = useMemo(() => {
    const map: Record<string, GoLiveGate> = {};
    for (const g of data?.gates?.goLive ?? []) map[g.gateType] = g;
    return map;
  }, [data]);

  function itemStatus(item: ChecklistItem): GateStatus {
    if (item.gateType && dbGatesByType[item.gateType]) {
      return dbGatesByType[item.gateType].status;
    }
    return checks[item.id] ? "passed" : "pending";
  }

  const total = ALL_ITEMS.length;
  const completed = useMemo(
    () => ALL_ITEMS.filter((i) => itemStatus(i) === "passed").length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbGatesByType, checks],
  );
  const blockers = useMemo(
    () => ALL_ITEMS.filter((i) => i.hardGate && itemStatus(i) !== "passed"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbGatesByType, checks],
  );

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const canGoLive = blockers.length === 0;

  return (
    <Link
      href="/dashboard/go-live"
      className={`group block rounded-xl border px-5 py-4 transition-colors ${
        canGoLive
          ? "border-emerald-200 bg-emerald-50 hover:bg-emerald-100/60"
          : "border-amber-200 bg-amber-50 hover:bg-amber-100/60"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            canGoLive ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"
          }`}
        >
          {canGoLive ? <Rocket size={18} /> : <AlertTriangle size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Go Live Readiness
          </p>
          <p className={`text-sm font-semibold mt-0.5 ${canGoLive ? "text-emerald-900" : "text-amber-900"}`}>
            {canGoLive
              ? "Ready to launch — every hard gate passed"
              : `${blockers.length} hard-gate item${blockers.length === 1 ? "" : "s"} pending`}
          </p>
          <div className="mt-2 h-1.5 w-full max-w-md rounded-full bg-white/60 overflow-hidden">
            <div
              className={`h-full transition-all ${canGoLive ? "bg-emerald-500" : "bg-amber-500"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-bold tracking-tight text-gray-900">{pct}%</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
            Complete
          </p>
        </div>
        <ArrowRight
          size={16}
          className="text-gray-400 shrink-0 transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
