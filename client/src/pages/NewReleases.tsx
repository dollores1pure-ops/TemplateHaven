import { Sparkles } from "lucide-react";

export default function NewReleases() {
  const highlights = [
    {
      title: "Modern SaaS Landing",
      description:
        "A launch-ready SaaS hero layout with pricing tables, testimonial carousel, and onboarding timeline.",
    },
    {
      title: "Premium Restaurant Experience",
      description:
        "Elegant menu sections, reservation CTA, and integrated photo gallery designed for hospitality brands.",
    },
    {
      title: "Creator Portfolio Showcase",
      description:
        "Showcase projects with masonry galleries, case study layouts, and frictionless contact forms.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <header className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-4 py-2 mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium uppercase tracking-wide">
            Fresh drops
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
          New Releases
        </h1>
        <p className="text-muted-foreground text-lg">
          Discover the latest templates our team has shipped. Every release is
          curated, performance-tested, and built to help you launch faster.
        </p>
      </header>

      <section className="grid gap-6">
        {highlights.map((highlight) => (
          <article
            key={highlight.title}
            className="rounded-2xl border bg-card/60 backdrop-blur-sm p-8 shadow-sm"
          >
            <h2 className="text-2xl font-semibold mb-2">{highlight.title}</h2>
            <p className="text-muted-foreground">{highlight.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
