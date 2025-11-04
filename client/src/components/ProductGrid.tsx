import TemplateCard from "./TemplateCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";
import type { Template } from "@shared/schema";
import { templateCategories } from "@shared/schema";

interface ProductGridProps {
  products: Template[];
  onPreview?: (templateId: string) => void;
  onAddToCart?: (templateId: string) => void;
  selectedCategory?: "all" | Template["category"];
  onCategorySelect?: (category: "all" | Template["category"]) => void;
  onFiltersClick?: () => void;
}

const categoryLabels: Record<string, string> = {
  all: "All",
  ecommerce: "E-Commerce",
  portfolio: "Portfolio",
  saas: "SaaS",
  restaurant: "Restaurant",
  corporate: "Corporate",
  fitness: "Fitness",
};

const categories = ["all", ...templateCategories] as const;

export default function ProductGrid({
  products,
  onPreview,
  onAddToCart,
  selectedCategory = "all",
  onCategorySelect,
  onFiltersClick,
}: ProductGridProps) {
  const normalizedProducts = products.filter((product) =>
    selectedCategory === "all" ? true : product.category === selectedCategory,
  );

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <h2
              className="text-4xl font-display font-bold tracking-tight mb-2"
              data-testid="text-section-title"
            >
              Explore Templates
            </h2>
            <p className="text-muted-foreground text-lg">
              Professionally designed and ready to customize
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            data-testid="button-filters"
            onClick={onFiltersClick}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className="cursor-pointer hover-elevate active-elevate-2 px-4 py-1.5"
              data-testid={`badge-filter-${category}`}
              onClick={() => onCategorySelect?.(category)}
            >
              {categoryLabels[category] ?? category}
            </Badge>
          ))}
        </div>

        {normalizedProducts.length === 0 ? (
          <div className="py-20 text-center border rounded-xl">
            <h3 className="text-2xl font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {normalizedProducts.map((product) => (
              <TemplateCard
                key={product.id}
                id={product.id}
                slug={product.slug}
                title={product.title}
                category={product.category}
                price={product.price}
                heroImage={product.heroImage}
                onPreview={() => onPreview?.(product.id)}
                onAddToCart={() => onAddToCart?.(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
