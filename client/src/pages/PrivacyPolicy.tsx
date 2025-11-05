const sections = [
  {
    title: "Information we collect",
    body:
      "We collect the details you provide when creating an account, purchasing templates, and interacting with support. This includes names, email addresses, billing details, and usage analytics that help us improve TemplateHub.",
  },
  {
    title: "How we use your information",
    body:
      "We use collected data to deliver template downloads, process payments, provide support, and keep you informed about product updates. We never sell your data to third parties.",
  },
  {
    title: "Your rights",
    body:
      "You can request access, updates, or deletion of your personal data at any time by contacting our support team. We respond to all privacy requests within 30 days.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <header className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground text-lg">
          Your privacy matters to us. This policy describes the data we collect
          and how it is used when you interact with TemplateHub.
        </p>
      </header>

      <section className="space-y-10">
        {sections.map((section) => (
          <article key={section.title} className="space-y-3">
            <h2 className="text-2xl font-semibold">{section.title}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {section.body}
            </p>
          </article>
        ))}
      </section>

      <footer className="mt-16 rounded-2xl border bg-card/60 p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Questions?</h2>
        <p className="text-muted-foreground">
          Reach us anytime at privacy@templatehub.com and we will help you with
          any data or privacy request.
        </p>
      </footer>
    </div>
  );
}
