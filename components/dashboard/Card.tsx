import type { LucideIcon } from "lucide-react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function Card({ children, title, subtitle, icon: Icon, action, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col ${className}`}
    >
      {(title || Icon) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-slate-50 rounded-lg text-blue-600">
                <Icon size={18} />
              </div>
            )}
            <div>
              <h3 className="font-bold text-slate-800 text-sm md:text-base">{title}</h3>
              {subtitle && (
                <p className="text-[10px] md:text-xs text-slate-500 font-medium">{subtitle}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      )}
      <div className="p-4 md:p-6 flex-1">{children}</div>
    </div>
  );
}
