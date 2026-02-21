import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background px-4 py-20 md:py-28">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Launch Your Diagnostic Lab or Clinic the Right Way.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground md:text-xl">
          AI-powered roadmap, compliance tracking, equipment planning & financial modeling — all in one platform.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg hover:opacity-90"
          >
            Get Started
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-border bg-card px-6 py-3 text-base font-semibold text-foreground hover:bg-muted"
          >
            Book Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
