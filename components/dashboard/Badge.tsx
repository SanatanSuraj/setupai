const styles: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  danger: "bg-rose-50 text-rose-700 border-rose-100",
  info: "bg-blue-50 text-blue-700 border-blue-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  slate: "bg-slate-100 text-slate-700 border-slate-200",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof styles;
}

export function Badge({ children, variant = "info" }: BadgeProps) {
  return (
    <span
      className={`text-[10px] md:text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${styles[variant] ?? styles.info}`}
    >
      {children}
    </span>
  );
}
