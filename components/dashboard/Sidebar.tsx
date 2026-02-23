"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/roadmap", label: "Roadmap" },
  { href: "/dashboard/licensing", label: "Licensing", pro: true },
  { href: "/dashboard/equipment", label: "Equipment" },
  { href: "/dashboard/staff", label: "Staff" },
  { href: "/dashboard/qc", label: "QC & SOP", pro: true },
  { href: "/dashboard/finance", label: "Finance", pro: true },
  { href: "/dashboard/operations", label: "Operations", enterprise: true },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-4">
        <Link href="/dashboard" className="font-bold text-primary">
          SetupAI
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {nav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
              {item.pro && <span className="ml-1 text-xs">Pro</span>}
              {item.enterprise && <span className="ml-1 text-xs">Ent</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
