import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ReviewRating = 5 | 4 | 3;

interface Review {
  id: number;
  name: string;
  title: string;
  company: string;
  rating: ReviewRating;
  comment: string;
}

const rawReviews: Array<Omit<Review, "id">> = [
  {
    name: "Lena M.",
    title: "Product Designer",
    company: "Northwind Studio",
    rating: 5,
    comment:
      "Launched our shop in a week—the sections mapped perfectly to our catalog and nothing felt generic.",
  },
  {
    name: "Jonas P.",
    title: "Founder",
    company: "Launch Cart",
    rating: 5,
    comment:
      "Animations feel premium and the responsive breakpoints were tuned out of the box.",
  },
  {
    name: "Aria L.",
    title: "Design Lead",
    company: "Nimbus Labs",
    rating: 5,
    comment:
      "Support documentation was crystal clear; even our junior devs shipped without getting stuck.",
  },
  {
    name: "Noah W.",
    title: "Growth Marketer",
    company: "Peak Funnel",
    rating: 5,
    comment:
      "The gallery and pricing blocks converted 30% better than our previous landing page.",
  },
  {
    name: "Priya S.",
    title: "Brand Strategist",
    company: "Orbit Collective",
    rating: 5,
    comment: "Loved the design tokens; swapping in our palette was a 10-minute job.",
  },
  {
    name: "Caleb R.",
    title: "Engineering Manager",
    company: "SprintWorks",
    rating: 5,
    comment:
      "Checkout integration was already thought through, which saved our team a full sprint.",
  },
  {
    name: "Hannah G.",
    title: "UX Researcher",
    company: "Human Insight",
    rating: 5,
    comment: "Typography pairing is gorgeous and reads well across devices.",
  },
  {
    name: "Mateo C.",
    title: "Creative Director",
    company: "Vista Agency",
    rating: 5,
    comment:
      "Clients keep complimenting the smooth hero transitions—great first impression.",
  },
  {
    name: "Isla K.",
    title: "Product Manager",
    company: "BrightStack",
    rating: 5,
    comment: "Global components made staging multiple niche versions painless.",
  },
  {
    name: "Gabriel T.",
    title: "Lead Developer",
    company: "Pixel Foundry",
    rating: 5,
    comment: "We imported Figma assets effortlessly; everything was neatly organized.",
  },
  {
    name: "Sofia D.",
    title: "Accessibility Lead",
    company: "Inclusive Web",
    rating: 5,
    comment:
      "Navigation patterns are modern and keyboard friendly, which is rare in templates.",
  },
  {
    name: "Marcus B.",
    title: "Brand Designer",
    company: "Signal & Form",
    rating: 5,
    comment: "Sections feel handcrafted—no obvious repetition, just thoughtful layouts.",
  },
  {
    name: "Avery N.",
    title: "Content Strategist",
    company: "StoryThread",
    rating: 5,
    comment:
      "Microcopy prompts throughout the template helped our marketing team craft better copy.",
  },
  {
    name: "Lucia F.",
    title: "Marketing Director",
    company: "Beacon Growth",
    rating: 5,
    comment: "Lighthouse scores stayed above 95 without extra optimization passes.",
  },
  {
    name: "Ethan V.",
    title: "Frontend Engineer",
    company: "Arcade Cloud",
    rating: 5,
    comment: "The included mobile nav is better than many bespoke builds I have seen.",
  },
  {
    name: "Maya H.",
    title: "Product Lead",
    company: "ScaleOps",
    rating: 5,
    comment: "Spacing scale is consistent, making custom blocks blend in seamlessly.",
  },
  {
    name: "Oliver Z.",
    title: "Head of Product",
    company: "Launchway",
    rating: 5,
    comment: "Hero, testimonial, and FAQ blocks were exactly what our SaaS launch needed.",
  },
  {
    name: "Zara Q.",
    title: "VP Marketing",
    company: "SignalPulse",
    rating: 5,
    comment:
      "Financial stakeholders loved the polished KPI cards—instant trust builder.",
  },
  {
    name: "Harper E.",
    title: "Localization Manager",
    company: "GlobeReach",
    rating: 5,
    comment: "RTL support worked immediately for our Arabic locale rollout.",
  },
  {
    name: "Leo A.",
    title: "Creative Strategist",
    company: "Frame & Fold",
    rating: 5,
    comment: "Brand photography shined thanks to the minimal frame designs.",
  },
  {
    name: "Jasmine Y.",
    title: "Performance Marketer",
    company: "Metric Harbor",
    rating: 5,
    comment: "Animations degrade gracefully, so older devices still feel quick.",
  },
  {
    name: "Nora U.",
    title: "Support Lead",
    company: "CarePath",
    rating: 5,
    comment:
      "Built-in form styling saved us hours of tinkering with validation states.",
  },
  {
    name: "Declan I.",
    title: "SEO Consultant",
    company: "RankCraft",
    rating: 5,
    comment: "SEO-ready markup and schema annotations were already in place.",
  },
  {
    name: "Imani O.",
    title: "Design Systems Lead",
    company: "Layered",
    rating: 5,
    comment: "The template's design system matched our B2B aesthetic to the letter.",
  },
  {
    name: "Wyatt L.",
    title: "Content Designer",
    company: "Clarity Lab",
    rating: 5,
    comment: "Captions and alt text suggestions were thoughtful and inclusive.",
  },
  {
    name: "Camila J.",
    title: "Product Strategist",
    company: "Delta Launch",
    rating: 5,
    comment:
      "We reused the pricing matrix for three new product tiers without touching code.",
  },
  {
    name: "Sebastian X.",
    title: "Digital Producer",
    company: "Fieldset Media",
    rating: 5,
    comment:
      "All assets are retina-ready; nothing looked blurry even on 4K monitors.",
  },
  {
    name: "Chloe R.",
    title: "Experience Designer",
    company: "Flowstate",
    rating: 5,
    comment:
      "The template scales elegantly from one-page to multi-section experiences.",
  },
  {
    name: "Dylan S.",
    title: "Analytics Lead",
    company: "Signal North",
    rating: 5,
    comment:
      "Our analytics show users spending longer on page thanks to the storytelling flow.",
  },
  {
    name: "Hazel P.",
    title: "Art Director",
    company: "Studio Redwood",
    rating: 5,
    comment:
      "The gradient overlays make our product visuals pop without extra editing.",
  },
  {
    name: "Gianna C.",
    title: "Content Lead",
    company: "Narrative Lab",
    rating: 5,
    comment:
      "Onboarding for new editors is effortless because components are clearly named.",
  },
  {
    name: "Rowan K.",
    title: "UX Writer",
    company: "Plaintext",
    rating: 5,
    comment: "Copy length defaults aligned with our voice guidelines almost perfectly.",
  },
  {
    name: "Elena B.",
    title: "Compliance Manager",
    company: "Trustline",
    rating: 5,
    comment:
      "Footer and legal components checked every compliance box we needed.",
  },
  {
    name: "Mason T.",
    title: "Investor",
    company: "Seedwave Capital",
    rating: 5,
    comment: "The template impressed our investors during demo day; it feels bespoke.",
  },
  {
    name: "Aisha W.",
    title: "Product Marketing Lead",
    company: "ClimbStack",
    rating: 5,
    comment:
      "Great balance of whitespace and density—reads great on desktop and mobile.",
  },
  {
    name: "Cooper D.",
    title: "Engineering Lead",
    company: "Binary Bay",
    rating: 5,
    comment: "Global dark mode styles worked instantly with our brand accents.",
  },
  {
    name: "Vivian M.",
    title: "Brand Director",
    company: "Palette & Co.",
    rating: 5,
    comment: "Reusable icon pairs gave our features section more personality.",
  },
  {
    name: "Rafael H.",
    title: "Motion Designer",
    company: "Curvehaus",
    rating: 5,
    comment: "Motion curves feel natural and subtle instead of gimmicky.",
  },
  {
    name: "Penelope V.",
    title: "Performance Analyst",
    company: "Spark Ledger",
    rating: 5,
    comment: "Asset optimization keeps page weight low even with rich imagery.",
  },
  {
    name: "Sanjay N.",
    title: "Customer Success Lead",
    company: "Scale Cycle",
    rating: 5,
    comment:
      "Support team responded fast and the template keeps getting quality updates.",
  },
  {
    name: "Talia R.",
    title: "Design Manager",
    company: "Atlas Agency",
    rating: 4,
    comment:
      "Beautiful layout, though we tweaked the spacing on tablets to match our guidelines.",
  },
  {
    name: "Hector B.",
    title: "Product Owner",
    company: "Vector Labs",
    rating: 4,
    comment:
      "Component library is strong; wish there were one or two more hero variations.",
  },
  {
    name: "Simone L.",
    title: "Growth Strategist",
    company: "Momentum Co.",
    rating: 4,
    comment:
      "Setup was smooth and performance solid, we just adjusted some color tokens.",
  },
  {
    name: "Bjorn G.",
    title: "Marketing Lead",
    company: "Nordwave",
    rating: 4,
    comment:
      "Great storytelling sections, but documentation could show more CMS examples.",
  },
  {
    name: "Farah T.",
    title: "Senior Designer",
    company: "Orbit UX",
    rating: 4,
    comment:
      "Loved the structure—added extra interactions to align with our motion system.",
  },
  {
    name: "Quentin C.",
    title: "Content Director",
    company: "Draft Studio",
    rating: 4,
    comment:
      "Typography looks great; only needed minor adjustments for long-form case studies.",
  },
  {
    name: "Lydia N.",
    title: "Head of Ops",
    company: "Bright Ladder",
    rating: 4,
    comment:
      "Navigation works well, yet mega-menu support out of the box would be perfect.",
  },
  {
    name: "Andre V.",
    title: "Creative Technologist",
    company: "Pulse Lab",
    rating: 4,
    comment:
      "Design is polished, we simply swapped a few icons to match our brand voice.",
  },
  {
    name: "Morgan J.",
    title: "Product Manager",
    company: "Lantern CRM",
    rating: 3,
    comment:
      "Solid starting point but required extra work to support multilingual content.",
  },
  {
    name: "Keisha P.",
    title: "Brand Lead",
    company: "Crescent Creative",
    rating: 3,
    comment:
      "Design quality is good, yet we had to rewrite sections for our niche messaging.",
  },
  {
    name: "Elliot D.",
    title: "Engineering Lead",
    company: "Stackline",
    rating: 3,
    comment:
      "Helpful base styles though advanced animation examples would be nice.",
  },
  {
    name: "Rina S.",
    title: "Operations Manager",
    company: "Flux Retail",
    rating: 3,
    comment:
      "Template looks sharp; documentation on data integrations felt light.",
  },
  {
    name: "Howard K.",
    title: "Content Strategist",
    company: "Narrative Ops",
    rating: 3,
    comment:
      "Appreciated the structure but had to rebuild the blog layout for long articles.",
  },
  {
    name: "Chelsea F.",
    title: "Digital Producer",
    company: "Bright Motion",
    rating: 3,
    comment:
      "Branding system is flexible, though slider options are limited without add-ons.",
  },
  {
    name: "Gareth O.",
    title: "Program Manager",
    company: "Enterprise Grid",
    rating: 3,
    comment:
      "Overall okay—needed custom dev time to align with our enterprise workflow.",
  },
];

const reviews: Review[] = rawReviews.map((review, index) => ({
  ...review,
  id: index + 1,
}));

const ratingBuckets: ReadonlyArray<ReviewRating> = [5, 4, 3];

const totalRatings = reviews.length;
const averageRating = Number(
  (reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings).toFixed(1),
);

const bucketCounts = ratingBuckets.map((rating) => {
  const count = reviews.filter((review) => review.rating === rating).length;
  return {
    rating,
    count,
    percentage: Math.round((count / totalRatings) * 100),
  };
});

function RatingStars({ rating }: { rating: number }) {
  const clampedRating = Math.max(0, Math.min(5, rating));

  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < clampedRating
              ? "text-amber-500 fill-amber-500"
              : "text-muted-foreground"
          }`}
          fill={index < clampedRating ? "currentColor" : "none"}
          strokeWidth={index < clampedRating ? 1 : 1.5}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-semibold">Customer Reviews</h2>
        <p className="text-muted-foreground mt-2">
          Feedback gathered from agencies, founders, and marketing teams using this
          template in production.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        <Card className="h-full border-dashed">
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="text-5xl font-display font-bold flex items-baseline gap-2">
                {averageRating.toFixed(1)}
                <span className="text-base font-medium text-muted-foreground">
                  / 5.0
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <RatingStars rating={Math.round(averageRating)} />
                <span className="text-sm text-muted-foreground">
                  ({totalRatings} reviews)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {bucketCounts.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-medium w-16">
                    <span>{rating}</span>
                    <Star className="h-3.5 w-3.5 text-amber-500" fill="none" />
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${count === 0 ? 0 : Math.max(6, percentage)}%`,
                      }}
                      aria-hidden
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-10 text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((review) => (
            <Card key={review.id} className="h-full">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{review.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {review.title} · {review.company}
                    </p>
                  </div>
                  <RatingStars rating={review.rating} />
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
