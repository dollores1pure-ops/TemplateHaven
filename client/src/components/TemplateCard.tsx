import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Eye, ShoppingCart } from "lucide-react";
import { useState } from "react";

interface TemplateCardProps {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  heroImage: string;
  onPreview?: () => void;
  onAddToCart?: () => void;
}

export default function TemplateCard({
  id,
  slug,
  title,
  category,
  price,
  heroImage,
  onPreview,
  onAddToCart,
}: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const normalizedTitle = title.toLowerCase().replace(/\s+/g, "-");
  const formattedCategory = category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return (
    <Card
      className="group overflow-hidden hover-elevate transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-template-${normalizedTitle}`}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={heroImage}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
        />
        <div
          className={`absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <Button
            size="sm"
            variant="secondary"
            onClick={onPreview}
            data-testid={`button-preview-${normalizedTitle}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={onAddToCart}
            data-testid={`button-add-cart-${normalizedTitle}`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="font-semibold text-lg line-clamp-1"
            data-testid={`text-title-${normalizedTitle}`}
          >
            {title}
          </h3>
          <Badge
            variant="secondary"
            className="shrink-0"
            data-testid={`badge-category-${category.toLowerCase()}`}
          >
            {formattedCategory}
          </Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <span
          className="text-2xl font-bold font-display tabular-nums"
          data-testid={`text-price-${normalizedTitle}`}
        >
          ${price}
        </span>
        <Button
          variant="ghost"
          size="sm"
          asChild
          data-testid={`button-details-${normalizedTitle}`}
        >
          <Link href={`/templates/${slug ?? id}`}>Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
