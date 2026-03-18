import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  children?: React.ReactNode;   // right-side actions
  badge?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = "text-blue-600",
  children,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-gray-100">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 mt-0.5">
            <Icon size={17} className={iconColor} />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">{children}</div>
      )}
    </div>
  );
}
