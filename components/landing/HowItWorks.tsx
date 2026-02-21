const steps = [
  {
    step: 1,
    title: "Choose lab type & city",
    description: "Select your setup (Basic / Medium / Advanced / Clinic+Lab) and target location.",
  },
  {
    step: 2,
    title: "Get AI roadmap",
    description: "We generate a personalized timeline, checklist, and cost estimate.",
  },
  {
    step: 3,
    title: "Track setup to go live",
    description: "Follow the roadmap, upload documents, and track progress until launch.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-gradient-to-b from-accent/5 to-background px-4 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Three steps from idea to operational lab.
        </p>
        <div className="mt-12 flex flex-col gap-8 md:flex-row md:justify-between">
          {steps.map((s) => (
            <div key={s.step} className="flex flex-1 flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {s.step}
              </div>
              <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
