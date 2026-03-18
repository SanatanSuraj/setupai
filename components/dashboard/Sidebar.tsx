"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/guide", label: "Setup Guide" },
  { href: "/dashboard/roadmap", label: "Roadmap" },
  { href: "/dashboard/licensing", label: "Licensing" },
  { href: "/dashboard/compliance", label: "Compliance" },
  { href: "/dashboard/documents", label: "Documents" },
  { href: "/dashboard/equipment", label: "Equipment" },
  { href: "/dashboard/staff", label: "Staffing & HR" },
  { href: "/dashboard/nabl", label: "NABL Accreditation" },
  { href: "/dashboard/operations", label: "Operations" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-border bg-card">
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
