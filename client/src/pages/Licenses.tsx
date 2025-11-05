const licenseTiers = [
  {
    name: "Personal",
    summary:
      "Single-use license for personal or portfolio projects. Includes lifetime updates.",
  },
  {
    name: "Commercial",
    summary:
      "Use in one commercial project with up to 10,000 monthly visitors. Includes access to Figma files.",
  },
  {
    name: "Extended",
    summary:
      "Unlimited commercial projects, transfer rights to clients, and priority support for launches.",
  },
];

export default function Licenses() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
          Licenses
        </h1>
        <p className="text-muted-foreground text-lg">
          Choose the license that matches the scale of your project. Every
          template purchase includes ongoing updates at no extra cost.
        </p>
      </header>

      <section className="space-y-6">
        {licenseTiers.map((tier) => (
          <article
            key={tier.name}
            className="rounded-2xl border bg-card/70 p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-2">{tier.name}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {tier.summary}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-2xl border bg-muted/40 p-6">
        <h2 className="text-xl font-semibold mb-2">Need a custom agreement?</h2>
        <p className="text-muted-foreground">
          We offer custom terms for agencies, enterprise teams, and high-traffic
          products. Email licensing@templatehub.com and we will tailor a plan for
          you.
        </p>
      </section>
    </div>
  );
}
