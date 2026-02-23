const stats = [
  { value: "40%", label: "faster setup" },
  { value: "60%", label: "fewer compliance errors" },
  { value: "100%", label: "structured workflow" },
];

export function Trust() {
  return (
    <section className="border-t border-border bg-muted/30 px-4 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold text-foreground md:text-4xl">
          Built for results
        </h2>
        <div className="mt-12 flex flex-wrap justify-center gap-12 md:gap-20">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold text-primary md:text-5xl">{s.value}</div>
              <div className="mt-1 text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
