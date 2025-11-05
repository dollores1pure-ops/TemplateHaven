import { Building2, Globe2, Users2 } from "lucide-react";

const values = [
  {
    icon: Building2,
    title: "Built for scale",
    description:
      "We craft design systems and template foundations that help teams ship polished experiences with confidence.",
  },
  {
    icon: Users2,
    title: "Human centered",
    description:
      "From freelancers to enterprise studios, we partner with people who care about elevating their digital presence.",
  },
  {
    icon: Globe2,
    title: "Global reach",
    description:
      "Our remote-first collective spans 6 time zones and supports launches in over 30 markets worldwide.",
  },
];

export default function Company() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-6">
          Company
        </h1>
        <p className="text-muted-foreground text-lg max-w-3xl">
          TemplateHub is a collective of designers, engineers, and storytellers
          dedicated to making professional web experiences accessible to every
          team.
        </p>
      </header>

      <section className="grid gap-8 md:grid-cols-3">
        {values.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="rounded-2xl border bg-card/60 p-6 shadow-sm"
          >
            <Icon className="h-10 w-10 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          </article>
        ))}
      </section>

      <section className="mt-16 space-y-6 max-w-3xl">
        <h2 className="text-2xl font-semibold">What we do</h2>
        <p className="text-muted-foreground">
          We build robust template ecosystems, documentation, and support for
          agencies and creators that need to ship quickly. From polished landing
          pages to complete e-commerce storefronts, our catalog is designed to
          accelerate your roadmap.
        </p>
        <p className="text-muted-foreground">
          When you work with TemplateHub, you gain a design partner that cares
          about measurable results—higher engagement, better conversions, and a
          consistent brand voice across platforms.
        </p>
      </section>
    </div>
  );
}
