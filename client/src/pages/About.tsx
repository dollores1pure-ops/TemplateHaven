export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
          About TemplateHub
        </h1>
        <p className="text-muted-foreground text-lg">
          We believe every team should be able to launch a beautiful, high
          performing website without starting from scratch.
        </p>
      </header>

      <section className="space-y-6">
        <p className="text-muted-foreground">
          TemplateHub began as a small side-project between designers and
          engineers frustrated by the gap between great ideas and the time it
          took to ship them. Today, thousands of teams use our templates to build
          marketing sites, digital products, and launch pages that feel crafted
          rather than cobbled together.
        </p>
        <p className="text-muted-foreground">
          We obsess over the details—from type scale and accessibility to motion
          design and micro-interactions. Every template is thoughtfully curated,
          documented, and paired with implementation guidelines so you can focus
          on your message, not your markup.
        </p>
        <p className="text-muted-foreground">
          Whether you are a solo creator or part of a global team, we hope our
          library helps you tell stories that resonate and products that shine.
        </p>
      </section>
    </div>
  );
}
