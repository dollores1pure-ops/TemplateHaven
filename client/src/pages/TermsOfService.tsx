const commitments = [
  {
    title: "Using TemplateHub templates",
    body:
      "Each purchase grants you a license to use the template for personal or commercial projects. You may not resell or redistribute the template files as-is.",
  },
  {
    title: "Accounts & security",
    body:
      "You are responsible for safeguarding your account credentials. Notify us immediately if you suspect unauthorized access or activity.",
  },
  {
    title: "Refund policy",
    body:
      "Due to the digital nature of our products, refunds are evaluated on a case-by-case basis. If you experience issues, contact support within 7 days of purchase.",
  },
  {
    title: "Updates & changes",
    body:
      "We may update these terms over time. When we do, we will notify account holders via email and update the effective date below.",
  },
];

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
          Terms of Service
        </h1>
        <p className="text-muted-foreground text-lg">
          These terms govern the use of TemplateHub products and services.
          Please read them carefully before downloading or using any template.
        </p>
      </header>

      <section className="space-y-10">
        {commitments.map(({ title, body }) => (
          <article key={title} className="space-y-3">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="text-muted-foreground leading-relaxed">{body}</p>
          </article>
        ))}
      </section>

      <footer className="mt-16 text-sm text-muted-foreground">
        <p>
          Effective date: <time dateTime="2024-01-10">January 10, 2024</time>
        </p>
        <p>
          Questions? Email us at legal@templatehub.com and we will be happy to
          help.
        </p>
      </footer>
    </div>
  );
}
