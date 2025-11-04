import TemplateCard from "./TemplateCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
}

interface ProductGridProps {
  products: Product[];
  onPreview?: (id: number) => void;
  onAddToCart?: (id: number) => void;
}

const categories = ["All", "E-Commerce", "Portfolio", "SaaS", "Restaurant", "Corporate", "Fitness"];

export default function ProductGrid({ products, onPreview, onAddToCart }: ProductGridProps) {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold tracking-tight mb-2" data-testid="text-section-title">
              Explore Templates
            </h2>
            <p className="text-muted-foreground text-lg">
              Professionally designed and ready to customize
            </p>
          </div>
          
          <Button variant="outline" size="sm" data-testid="button-filters">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={category === "All" ? "default" : "secondary"}
              className="cursor-pointer hover-elevate active-elevate-2 px-4 py-1.5"
              data-testid={`badge-filter-${category.toLowerCase()}`}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product) => (
            <TemplateCard
              key={product.id}
              {...product}
              onPreview={() => onPreview?.(product.id)}
              onAddToCart={() => onAddToCart?.(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
