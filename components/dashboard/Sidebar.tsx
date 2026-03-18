"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Map,
  FileCheck,
  ShieldCheck,
  FileText,
  Wrench,
  Users,
  Award,
  Activity,
  LogOut,
  Microscope,
  ChevronRight,
} from "lucide-react";

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard",        label: "Overview",           icon: LayoutDashboard },
      { href: "/dashboard/guide",  label: "Setup Guide",        icon: BookOpen },
      { href: "/dashboard/roadmap",label: "Roadmap",            icon: Map },
    ],
  },
  {
    label: "Compliance",
    items: [
      { href: "/dashboard/licensing",   label: "Licensing",         icon: FileCheck },
      { href: "/dashboard/compliance",  label: "Compliance",        icon: ShieldCheck },
      { href: "/dashboard/nabl",        label: "NABL",              icon: Award },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/dashboard/documents",   label: "Documents",         icon: FileText },
      { href: "/dashboard/equipment",   label: "Equipment",         icon: Wrench },
      { href: "/dashboard/staff",       label: "Staff & HR",        icon: Users },
      { href: "/dashboard/operations",  label: "Operations",        icon: Activity },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[220px] shrink-0 flex-col bg-[#0d1117] overflow-hidden">

      {/* Logo */}
      <div className="flex h-[57px] items-center gap-2.5 px-4 border-b border-white/[0.06]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-900/40">
          <Microscope size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm leading-none tracking-tight">SetupAI</p>
          <p className="text-[10px] text-white/30 leading-none mt-1 font-medium">Lab Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.08em] px-2 mb-1.5">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-all duration-100 ${
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:bg-white/5 hover:text-white/80"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={`shrink-0 ${isActive ? "text-white" : "text-white/40 group-hover:text-white/60"}`}
                    />
                    <span className="truncate flex-1">{item.label}</span>
                    {isActive && (
                      <ChevronRight size={12} className="text-white/30 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-white/40 hover:bg-white/5 hover:text-white/70 transition-all duration-100 group"
        >
          <LogOut size={14} className="shrink-0 group-hover:text-white/50" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
