const problems = [
  {
    title: "Regulatory confusion",
    description: "NABL, BMW, Fire NOC, Clinical Establishment — knowing what applies and in what order.",
    icon: "📋",
  },
  {
    title: "Equipment selection mistakes",
    description: "Wrong analyzers, overspending, or under-investing in critical equipment.",
    icon: "🔬",
  },
  {
    title: "Staffing challenges",
    description: "Finding pathologists, technicians, and phlebotomists who meet compliance requirements.",
    icon: "👥",
  },
  {
    title: "Delays & penalties",
    description: "Poor sequencing and missed deadlines leading to fines and delayed launch.",
    icon: "⚠️",
  },
];

export function Problems() {
  return (
    <section className="border-t border-border bg-muted/30 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          Sound familiar?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Indian lab and clinic entrepreneurs face these pain points every day.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
            >
              <span className="text-2xl">{p.icon}</span>
              <h3 className="mt-3 font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
