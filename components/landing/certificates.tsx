"use client";

export default function Certificates() {
  return (
    <section className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            Certifications & Awards
          </h1>
          <p className="mt-3 text-muted-foreground">
            Explore our recognitions and certifications.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-border shadow-sm">
          <iframe
            src="https://www.mobilab.in/certifications-awards"
            className="h-[800px] w-full"
            loading="lazy"
          />
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://www.mobilab.in/certifications-awards"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Open in New Tab
          </a>
        </div>
      </div>
    </section>
  );
}