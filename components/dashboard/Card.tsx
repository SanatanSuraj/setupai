import type { LucideIcon } from "lucide-react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
  /**
   * "default"  — white, subtle border + xs shadow  (most common)
   * "outline"  — white, slightly stronger border, no shadow
   * "flat"     — gray-50 bg, no shadow
   * "ghost"    — no border, no shadow, transparent bg
   */
  variant?: "default" | "outline" | "flat" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  noDivider?: boolean;
}

const variantStyles = {
  default: "bg-white border border-gray-100 shadow-card",
  outline: "bg-white border border-gray-200",
  flat:    "bg-gray-50 border border-gray-100",
  ghost:   "bg-transparent",
};

const paddingStyles = {
  none: "p-0",
  sm:   "p-3 md:p-4",
  md:   "p-4 md:p-5",
  lg:   "p-5 md:p-6",
};

export function Card({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = "",
  variant = "default",
  padding = "md",
  noDivider = false,
}: CardProps) {
  const hasHeader = title || Icon || action;

  return (
    <div
      className={`rounded-xl overflow-hidden flex flex-col ${variantStyles[variant]} ${className}`}
    >
      {hasHeader && (
        <div className={`flex items-center justify-between px-5 py-3.5 ${!noDivider ? "border-b border-gray-100" : ""}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">
                <Icon size={14} />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-sm font-semibold text-gray-900 leading-tight truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-400 mt-0.5 leading-tight">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0 ml-3">{action}</div>}
        </div>
      )}
      <div className={`flex-1 ${paddingStyles[padding]}`}>{children}</div>
    </div>
  );
}

/* ─── Convenience wrappers ───────────────────────────────────────────────── */

/** A standalone stat display card */
export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "blue",
  trend,
  className = "",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  accent?: "blue" | "green" | "amber" | "red" | "violet" | "slate";
  trend?: { value: string; up?: boolean };
  className?: string;
}) {
  const accentMap = {
    blue:   { icon: "bg-blue-50 text-blue-600",   val: "text-gray-900" },
    green:  { icon: "bg-green-50 text-green-600",  val: "text-green-700" },
    amber:  { icon: "bg-amber-50 text-amber-600",  val: "text-amber-700" },
    red:    { icon: "bg-red-50 text-red-600",      val: "text-red-700" },
    violet: { icon: "bg-violet-50 text-violet-600",val: "text-gray-900" },
    slate:  { icon: "bg-gray-100 text-gray-500",   val: "text-gray-900" },
  };
  const a = accentMap[accent];

  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
          <p className={`text-2xl font-bold mt-1 tracking-tight ${a.val}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.icon}`}>
            <Icon size={17} />
          </div>
        )}
      </div>
      {trend && (
        <p className={`text-xs font-medium mt-3 ${trend.up !== false ? "text-green-600" : "text-red-500"}`}>
          {trend.value}
        </p>
      )}
    </div>
  );
}
