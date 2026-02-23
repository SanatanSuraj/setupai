import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 p-8 text-center md:p-12">
        <h2 className="text-2xl font-bold text-foreground md:text-3xl">
          Ready to launch your lab?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Join diagnostic lab and clinic entrepreneurs who use SetupAI to go live faster.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            Get Started
          </Link>
          <Link
            href="/contact"
            className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground hover:bg-muted"
          >
            Book Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
