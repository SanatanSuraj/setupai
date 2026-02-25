"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          SetupAI
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Pricing
          </Link>

          <Link
            href="/contact"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Contact
          </Link>

          {/* ✅ Always Visible */}
          <a
            href="https://www.mobilab.in/products"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Products
          </a>
          <a
            href="https://www.mobilab.in/certifications-awards"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Certifications & Awards
          </a>

          {status === "loading" ? (
            <span className="text-sm text-muted-foreground">...</span>
          ) : session ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground hover:underline"
              >
                Log in
              </Link>

              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}