"use client";

import React, { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { pageGuides } from "@/lib/quest-configs";
import type { Quest, PageGuide } from "@/lib/quest-configs";

// ─── localStorage key ─────────────────────────────────────────────────────────
const WELCOMED_KEY = "guide_welcomed";

// ─── Keyframes ────────────────────────────────────────────────────────────────
const GUIDE_STYLES = `
  @keyframes guide-pop-in {
    0%   { transform: scale(0.55); opacity: 0; }
    60%  { transform: scale(1.06); opacity: 1; }
    80%  { transform: scale(0.96); }
    100% { transform: scale(1);    opacity: 1; }
  }
  @keyframes guide-float {
    0%, 100% { transform: translateY(0px)  rotate(0deg);  }
    35%       { transform: translateY(-7px) rotate(-3deg); }
    65%       { transform: translateY(-5px) rotate(2deg);  }
  }
  @keyframes guide-wiggle {
    0%   { transform: rotate(0deg)   scale(1);    }
    12%  { transform: rotate(-14deg) scale(1.12); }
    28%  { transform: rotate(12deg)  scale(1.12); }
    44%  { transform: rotate(-8deg)  scale(1.06); }
    58%  { transform: rotate(5deg)   scale(1.03); }
    72%  { transform: rotate(-2deg)  scale(1.01); }
    100% { transform: rotate(0deg)   scale(1);    }
  }
  @keyframes guide-orbit {
    from { transform: rotate(0deg);   }
    to   { transform: rotate(360deg); }
  }
  @keyframes guide-orbit-rev {
    from { transform: rotate(0deg);    }
    to   { transform: rotate(-360deg); }
  }
  @keyframes guide-glow-pulse {
    0%, 100% { box-shadow: 0 0 18px 3px rgba(255,255,255,0.15), 0 6px 28px rgba(0,0,0,0.5); }
    50%       { box-shadow: 0 0 36px 10px rgba(255,255,255,0.28), 0 6px 28px rgba(0,0,0,0.5); }
  }
  @keyframes guide-quest-in {
    from { opacity: 0; transform: translateY(18px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes guide-label-in {
    from { opacity: 0; transform: translateX(12px); }
    to   { opacity: 1; transform: translateX(0);    }
  }
  @keyframes guide-shimmer {
    0%   { background-position: 0% 50%;   }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%;   }
  }
  @keyframes guide-badge-pop {
    0%   { transform: scale(0) rotate(-25deg); }
    65%  { transform: scale(1.25) rotate(6deg); }
    100% { transform: scale(1)   rotate(0deg);  }
  }
  @keyframes guide-dot-bounce {
    0%, 100% { transform: scale(1);    }
    50%       { transform: scale(1.35); }
  }
  @keyframes guide-backdrop-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes guide-bubble-in {
    0%   { opacity: 0; transform: translateY(12px) scale(0.9); }
    60%  { transform: translateY(-3px) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes guide-bubble-out {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(8px) scale(0.95); }
  }
  @keyframes guide-pill-in {
    0%   { opacity: 0; transform: scale(0.7); }
    65%  { transform: scale(1.07); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes guide-cursor-blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
  @keyframes guide-text-reveal {
    from { clip-path: inset(0 100% 0 0); }
    to   { clip-path: inset(0 0% 0 0);   }
  }
  @keyframes guide-arrow-bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(4px); }
  }
`;

// ─── localStorage helpers ─────────────────────────────────────────────────────
const questKey = (p: string) => `guide_quests_${p.replace(/\//g, "_")}`;
const GLOBAL_XP_KEY = "guide_total_xp";
const BADGES_KEY    = "guide_badges";
const SEEN_KEY      = "guide_seen_pages";

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── XP Toast ─────────────────────────────────────────────────────────────────
function XPToast({ amount, visible }: { amount: number; visible: boolean }) {
  return (
    <div className={`pointer-events-none fixed bottom-28 right-6 z-[9999] flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-yellow-900 shadow-xl transition-all duration-500 ${visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-90"}`}>
      ⚡ +{amount} XP
    </div>
  );
}

// ─── Badge Toast ──────────────────────────────────────────────────────────────
function BadgeToast({ emoji, name, visible }: { emoji: string; name: string; visible: boolean }) {
  return (
    <div className={`pointer-events-none fixed bottom-40 right-6 z-[9999] flex flex-col items-center gap-1 rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500 to-amber-500 px-5 py-3 text-center shadow-2xl transition-all duration-700 ${visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-6 scale-95 opacity-0"}`}>
      <span className="text-3xl" style={visible ? { animation: "guide-badge-pop 0.5s ease-out forwards" } : {}}>{emoji}</span>
      <span className="text-xs font-bold text-yellow-900">Badge Unlocked!</span>
      <span className="text-sm font-semibold text-yellow-900">{name}</span>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
      <div
        className="h-full rounded-full bg-white transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Quest Item ───────────────────────────────────────────────────────────────
function QuestItem({
  quest, index, done, active, onToggle, onSetActive, animate,
}: {
  quest: Quest; index: number; done: boolean; active: boolean;
  onToggle: () => void; onSetActive: () => void; animate: boolean;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl border transition-all duration-300 ${done ? "border-emerald-500/30 bg-emerald-950/40" : active ? "border-white/30 bg-white/10 shadow-lg" : "border-white/10 bg-white/5 hover:bg-white/[0.08]"}`}
      style={animate ? { animation: `guide-quest-in 0.38s ease-out ${80 + index * 75}ms both` } : {}}
    >
      {/* header row */}
      <button onClick={onSetActive} className="flex w-full items-start gap-3 p-3 text-left">
        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${done ? "bg-emerald-500 text-white" : active ? "bg-white text-slate-900" : "bg-white/20 text-white/70"}`}>
          {done ? "✓" : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${done ? "text-emerald-400 line-through" : "text-white"}`}>
            {quest.title}
          </p>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-medium text-yellow-300">
            ⚡ +{quest.reward} XP
          </span>
        </div>
        <span className={`mt-0.5 shrink-0 text-white/40 transition-transform duration-200 ${active ? "rotate-180" : ""}`}>▾</span>
      </button>

      {/* expanded detail */}
      <div className={`overflow-hidden transition-all duration-300 ${active ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="space-y-3 border-t border-white/10 p-3">
          <div className="flex items-start gap-2 rounded-lg bg-blue-500/20 px-3 py-2">
            <span className="shrink-0 text-blue-300">💡</span>
            <p className="text-xs italic text-blue-200">{quest.tooltip}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-lg leading-none">🗺️</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Where to find it</p>
              <p className="text-xs text-white/80">{quest.location}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-lg leading-none">🎮</span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/50">What to do</p>
              <p className="text-xs text-white/80">{quest.action}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`w-full rounded-lg py-2 text-sm font-semibold transition-all active:scale-95 ${done ? "bg-emerald-500/20 text-emerald-400 hover:bg-red-500/20 hover:text-red-400" : "bg-white text-slate-900 hover:bg-white/90"}`}
          >
            {done ? "✓ Done — click to undo" : "✅ Mark as Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Welcome Bubble ───────────────────────────────────────────────────────────
function WelcomeBubble({ onDismiss, color }: { onDismiss: () => void; color: string }) {
  const [closing, setClosing] = useState(false);

  const dismiss = () => {
    setClosing(true);
    setTimeout(onDismiss, 350);
  };

  return (
    <div
      className="absolute bottom-20 right-0 w-64 z-10"
      style={{ animation: closing ? "guide-bubble-out 0.35s ease-in forwards" : "guide-bubble-in 0.5s cubic-bezier(0.34,1.4,0.64,1) forwards" }}
    >
      {/* Card */}
      <div className="relative rounded-2xl bg-slate-900 p-4 shadow-2xl ring-1 ring-white/15">
        {/* Gradient top bar */}
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl" style={{ background: color }} />

        {/* Header */}
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xl">📖</span>
          <p
            className="text-sm font-bold text-white"
            style={{ animation: "guide-text-reveal 0.7s steps(20,end) 0.3s both" }}
          >
            User Manual
          </p>
          <span
            className="ml-auto text-white/40"
            style={{ animation: "guide-cursor-blink 0.8s step-end 0.3s 4" }}
          >|</span>
        </div>

        <p className="mb-3 text-xs leading-relaxed text-white/60">
          Every page has an <span className="font-semibold text-white/90">interactive guide</span> — step-by-step quests, XP rewards, and badges to help you master the platform.
        </p>

        {/* Highlights row */}
        <div className="mb-3 flex gap-2">
          {["🎯 Quests", "⚡ XP", "🏅 Badges"].map((t) => (
            <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/70">{t}</span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={dismiss}
          className="w-full rounded-xl py-2 text-xs font-bold text-white transition hover:opacity-90 active:scale-95"
          style={{ background: color }}
        >
          Got it — let&apos;s explore! →
        </button>
      </div>

      {/* Caret arrow pointing down to button */}
      <div
        className="ml-auto mr-5 h-0 w-0 border-x-8 border-t-8 border-x-transparent border-t-slate-900"
        style={{ animation: "guide-arrow-bounce 1.2s ease-in-out infinite" }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function GamifiedGuide() {
  const pathname = usePathname();
  const [isOpen,        setIsOpen]        = useState(false);
  const [modalKey,      setModalKey]      = useState(0);
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [completed,     setCompleted]     = useState<Record<string, boolean>>({});
  const [, setTotalXP] = useState(0);
  const [badges,        setBadges]        = useState<string[]>([]);
  const [isPulsing,     setIsPulsing]     = useState(false);
  const [showWelcome,   setShowWelcome]   = useState(false);
  const [xpToast,       setXpToast]       = useState({ amount: 0, visible: false });
  const [badgeToast,    setBadgeToast]    = useState({ emoji: "", name: "", visible: false });

  const guide = pageGuides.find((g) => g.pathname === pathname);

  useEffect(() => {
    setTotalXP(loadJSON<number>(GLOBAL_XP_KEY, 0));
    setBadges(loadJSON<string[]>(BADGES_KEY, []));
    // Show welcome bubble on very first ever visit to the app
    const welcomed = loadJSON<boolean>(WELCOMED_KEY, false);
    if (!welcomed) {
      setTimeout(() => setShowWelcome(true), 1200);
    }
  }, []);

  useEffect(() => {
    if (!guide) return;
    const saved = loadJSON<Record<string, boolean>>(questKey(pathname), {});
    setCompleted(saved);
    setActiveQuestId(null);
    setIsOpen(false);

    const allDone   = guide.quests.every((q) => saved[q.id]);
    const seenPages = loadJSON<string[]>(SEEN_KEY, []);
    if (!seenPages.includes(pathname) && !allDone) {
      setIsPulsing(true);
      const t = setTimeout(() => setIsPulsing(false), 6000);
      saveJSON(SEEN_KEY, [...seenPages, pathname]);
      return () => clearTimeout(t);
    }
  }, [pathname, guide]);

  const openGuide = () => {
    setIsOpen(true);
    setModalKey((k) => k + 1);
    setIsPulsing(false);
  };

  const toggleQuest = useCallback(
    (quest: Quest, guide: PageGuide) => {
      setCompleted((prev) => {
        const wasCompleted = prev[quest.id];
        const next = { ...prev, [quest.id]: !wasCompleted };
        saveJSON(questKey(pathname), next);

        const xpDelta = wasCompleted ? -quest.reward : quest.reward;
        setTotalXP((xp) => {
          const n = Math.max(0, xp + xpDelta);
          saveJSON(GLOBAL_XP_KEY, n);
          return n;
        });

        if (!wasCompleted) {
          setXpToast({ amount: quest.reward, visible: true });
          setTimeout(() => setXpToast((t) => ({ ...t, visible: false })), 2000);

          const allDone = guide.quests.every((q) => next[q.id]);
          if (allDone) {
            setBadges((prev) => {
              if (prev.includes(guide.completionBadge)) return prev;
              const nb = [...prev, guide.completionBadge];
              saveJSON(BADGES_KEY, nb);
              setBadgeToast({ emoji: guide.badgeEmoji, name: guide.completionBadge, visible: true });
              setTimeout(() => setBadgeToast((t) => ({ ...t, visible: false })), 3500);
              return nb;
            });
          }
        }
        return next;
      });
    },
    [pathname]
  );

  if (!guide) return null;

  const completedCount = guide.quests.filter((q) => completed[q.id]).length;
  const progress       = Math.round((completedCount / guide.quests.length) * 100);
  const allDone        = completedCount === guide.quests.length;
  const hasBadge       = badges.includes(guide.completionBadge);

  return (
    <>
      {/* ── Inject keyframes ── */}
      <style dangerouslySetInnerHTML={{ __html: GUIDE_STYLES }} />

      {/* ── Toasts ── */}
      <XPToast amount={xpToast.amount} visible={xpToast.visible} />
      <BadgeToast emoji={badgeToast.emoji} name={badgeToast.name} visible={badgeToast.visible} />

      {/* ── Floating Trigger ── */}
      <div
        className="fixed bottom-6 right-6 z-[9998] flex flex-col items-end gap-1"
        style={{
          animation: isPulsing
            ? "guide-wiggle 0.7s ease-in-out, guide-float 3.5s ease-in-out 0.7s infinite"
            : "guide-float 3.5s ease-in-out infinite",
        }}
      >
        {/* Welcome bubble — first-ever visit */}
        {showWelcome && !isOpen && (
          <WelcomeBubble
            color={guide.gradient}
            onDismiss={() => {
              setShowWelcome(false);
              saveJSON(WELCOMED_KEY, true);
            }}
          />
        )}

        {/* "New Quests!" tooltip — new page visits */}
        {isPulsing && !isOpen && !showWelcome && (
          <span
            className="whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xl ring-1 ring-white/10"
            style={{ animation: "guide-label-in 0.35s ease-out forwards" }}
          >
            🎮 New Quests!
          </span>
        )}

        {/* Orbit rings — only when pulsing */}
        {isPulsing && !isOpen && (
          <>
            <span className="pointer-events-none absolute inset-0 -m-2 rounded-full border-2 border-dashed border-white/30" style={{ animation: "guide-orbit 3s linear infinite" }} />
            <span className="pointer-events-none absolute inset-0 -m-3.5 rounded-full border border-white/15" style={{ animation: "guide-orbit-rev 5s linear infinite" }} />
          </>
        )}

        {/* Pill button */}
        <button
          onClick={openGuide}
          className="relative flex items-center gap-2 rounded-full px-4 py-2.5 shadow-2xl transition-transform duration-200 hover:scale-105 active:scale-95"
          style={{
            background: guide.gradient,
            animation: "guide-glow-pulse 2.5s ease-in-out infinite, guide-pill-in 0.5s cubic-bezier(0.34,1.4,0.64,1) both",
          }}
        >
          <span className="text-lg select-none">{guide.emoji}</span>
          <span className="text-sm font-bold text-white">User Manual</span>

          {/* Completed count badge */}
          {completedCount > 0 && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-yellow-900"
              style={{ animation: "guide-dot-bounce 1.8s ease-in-out infinite" }}
            >
              {completedCount}
            </span>
          )}
        </button>

        {/* Persistent sub-label */}
        <p className="text-center text-[10px] font-medium tracking-wide text-white/40 drop-shadow">
          Interactive Page Guide
        </p>
      </div>

      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9996] bg-black/65 backdrop-blur-sm"
          style={{ animation: "guide-backdrop-in 0.25s ease-out forwards" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Centering shell (no transform — avoids keyframe conflict) ── */}
      <div
        className={`fixed inset-0 z-[9997] flex items-center justify-center pointer-events-none ${isOpen ? "" : "hidden"}`}
      >
        {/* ── Modal card ── */}
        <div
          key={modalKey}
          className="pointer-events-auto flex w-[92vw] max-w-lg flex-col rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-white/10"
          style={{
            maxHeight: "88vh",
            animation: "guide-pop-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
          }}
        >
          {/* ── Mission Header ── */}
          <div
            className="shrink-0 rounded-t-2xl p-5"
            style={{
              background: guide.gradient,
              backgroundSize: "200% 200%",
              animation: "guide-shimmer 6s ease infinite",
            }}
          >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Quest Guide</p>
              <h2 className="mt-0.5 text-base font-bold leading-tight text-white">
                {guide.emoji} {guide.mission}
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/25 text-white/70 transition hover:bg-black/45 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-white/70">
              <span>{completedCount}/{guide.quests.length} quests</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <ProgressBar pct={progress} />
          </div>

          {/* Badge strip */}
          {allDone ? (
            <div
              className="mt-3 flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2"
              style={{ animation: "guide-badge-pop 0.5s ease-out forwards" }}
            >
              <span className="text-2xl">{guide.badgeEmoji}</span>
              <div>
                <p className="text-xs font-bold text-yellow-300">Badge Earned!</p>
                <p className="text-xs text-white/80">{guide.completionBadge}</p>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2">
              <span className="text-xl opacity-35">{guide.badgeEmoji}</span>
              <div>
                <p className="text-xs text-white/50">Complete all quests to unlock</p>
                <p className="text-xs font-semibold text-white/70">{guide.completionBadge} Badge</p>
              </div>
            </div>
          )}
          </div>

          {/* ── Earned Badges Bar ── */}
          {badges.length > 0 && (
            <div className="shrink-0 border-b border-white/10 bg-slate-800/60 px-4 py-2">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">Your Badges</p>
              <div className="flex flex-wrap gap-1.5">
                {badges.map((b) => {
                  const found = pageGuides.find((g) => g.completionBadge === b);
                  return (
                    <span key={b} className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">
                      {found?.badgeEmoji ?? "🏅"} {b}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Quest List ── */}
          <div className="flex-1 space-y-2.5 overflow-y-auto p-4 pb-4" style={{ maxHeight: "42vh" }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Page Quests</p>

            {guide.quests.map((quest, i) => (
              <QuestItem
                key={quest.id}
                quest={quest}
                index={i}
                done={!!completed[quest.id]}
                active={activeQuestId === quest.id}
                animate={true}
                onSetActive={() => setActiveQuestId((id) => (id === quest.id ? null : quest.id))}
                onToggle={() => toggleQuest(quest, guide)}
              />
            ))}

            {/* Completion card */}
            {allDone && (
              <div
                className="mt-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 p-4 text-center"
                style={{ animation: "guide-pop-in 0.5s ease-out forwards" }}
              >
                <p className="text-2xl">🎉</p>
                <p className="mt-1 text-sm font-bold text-emerald-400">Page Mastered!</p>
                <p className="text-xs text-emerald-300/70">You&apos;ve completed all quests on this page.</p>
                {hasBadge && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-semibold text-yellow-300">
                    {guide.badgeEmoji} {guide.completionBadge} Badge Earned
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="shrink-0 rounded-b-2xl border-t border-white/10 bg-slate-900/95 px-4 py-3">
            <p className="text-center text-xs text-white/30">
              Click a quest → do the action → mark complete
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
