import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Products() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <header className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
          Our Products
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl">
          Explore ready-to-launch website templates crafted for modern brands,
          creators, and teams.
        </p>
      </header>

      <section className="grid gap-10">
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">Template Catalog</h2>
          <p className="text-muted-foreground mb-6">
            Browse our full library of premium templates spanning e-commerce,
            SaaS, portfolio, restaurant, fitness, and corporate categories.
            Each template includes responsive layouts, polished typography, and
            a complete component system.
          </p>
          <Button asChild size="lg">
            <Link href="/">
              <span>Browse Featured Templates</span>
            </Link>
          </Button>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">Tailored Experiences</h2>
          <p className="text-muted-foreground mb-6">
            Each product is built with accessibility, performance, and easy
            customization in mind. Quickly adapt colors, typography, content,
            and imagery to match your brand and launch in days, not weeks.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/categories">Explore Categories</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/new-releases">See New Releases</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-3">Included With Every Purchase</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Unlimited personal and commercial usage rights</li>
            <li>Regular updates that keep your template compatible with new tooling</li>
            <li>Comprehensive documentation and setup guides</li>
            <li>Access to premium Figma files where available</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
