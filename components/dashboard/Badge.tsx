const styles: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
  danger:  "bg-red-50 text-red-600 ring-1 ring-red-200/80",
  info:    "bg-blue-50 text-blue-700 ring-1 ring-blue-200/80",
  purple:  "bg-violet-50 text-violet-700 ring-1 ring-violet-200/80",
  slate:   "bg-gray-100 text-gray-600 ring-1 ring-gray-200/50",
  orange:  "bg-orange-50 text-orange-700 ring-1 ring-orange-200/80",
};

const dotColors: Record<string, string> = {
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-red-500",
  info:    "bg-blue-500",
  purple:  "bg-violet-500",
  slate:   "bg-gray-400",
  orange:  "bg-orange-500",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof styles;
  dot?: boolean;
  size?: "sm" | "md";
}

export function Badge({ children, variant = "info", dot = false, size = "sm" }: BadgeProps) {
  const sizeClass = size === "md"
    ? "text-xs px-2.5 py-1"
    : "text-[11px] px-2 py-0.5";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap ${sizeClass} ${styles[variant] ?? styles.info}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[variant] ?? dotColors.info}`} />
      )}
      {children}
    </span>
  );
}
