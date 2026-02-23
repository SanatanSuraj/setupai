import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <span className="font-semibold text-primary">SetupAI</span>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link href="/contact" className="hover:text-foreground">Contact</Link>
          <Link href="/login" className="hover:text-foreground">Login</Link>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-6xl text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SetupAI. Diagnostic Lab & Clinic Setup Platform.
      </p>
    </footer>
  );
}
