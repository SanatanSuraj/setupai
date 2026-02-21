const features = [
  {
    title: "Guided Setup Roadmap",
    description: "Step-by-step timeline, task checklist, and cost estimate based on your lab type and city.",
    icon: "🗺️",
  },
  {
    title: "Licensing & Compliance Tracker",
    description: "State-based checklists, document uploads, and status tracking for all required licenses.",
    icon: "📜",
  },
  {
    title: "Equipment & ROI Planner",
    description: "Test-menu-based equipment recommendations, vendor comparison, and CAPEX calculator.",
    icon: "🔧",
  },
  {
    title: "QC & SOP System",
    description: "Pre-built SOP templates, QC value tracking, alerts, and corrective action logging.",
    icon: "✅",
  },
  {
    title: "Financial Modeling",
    description: "CAPEX, OPEX, revenue projection, and break-even analysis in one place.",
    icon: "📊",
  },
  {
    title: "Multi-location Dashboard",
    description: "Enterprise-ready view for franchise and multi-site operations.",
    icon: "🏢",
  },
];

export function Features() {
  return (
    <section className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          Everything you need to go live
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          One platform for setup, compliance, equipment, QC, and finance.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
