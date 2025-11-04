import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import { fetchTemplates } from "@/lib/api";
import TemplateCard from "@/components/TemplateCard";
import { templateCategories } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { addCartItem } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const categoryDescriptions: Record<string, string> = {
  ecommerce:
    "High-converting storefronts ready for modern commerce experiences.",
  portfolio:
    "Beautiful layouts to showcase your creative work and case studies.",
  saas: "Conversion-focused landing pages tailored for software and startups.",
  restaurant:
    "Mouthwatering designs for restaurants, cafés, and hospitality brands.",
  corporate:
    "Professional templates for enterprise, consulting, and B2B brands.",
  fitness: "Energetic websites for gyms, studios, and personal trainers.",
};

export default function Categories() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const templatesQuery = useQuery({
    queryKey: ["templates", { page: "categories" }],
    queryFn: () => fetchTemplates({ status: "published" }),
  });

  const templates = templatesQuery.data?.data ?? [];

  const addToCartMutation = useMutation({
    mutationFn: (id: string) => addCartItem(id),
    onSuccess: (cart) => {
      queryClient.setQueryData(["cart"], cart);
      toast({
        title: "Template added to cart",
        description: "You can review your cart before checkout.",
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Could not add template",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm px-4 py-1">
            Explore by category
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-display font-bold">
            Find The Perfect Template For Your Next Launch
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse curated collections crafted for popular industries and use
            cases. Each template includes polished sections, responsive layouts,
            and conversion-optimised experiences out of the box.
          </p>
        </div>

        {templatesQuery.isLoading ? (
          <div className="text-center text-muted-foreground py-20">
            Loading categories...
          </div>
        ) : (
          <div className="space-y-12">
            {templateCategories.map((category) => {
              const categoryTemplates = templates.filter(
                (template) => template.category === category,
              );

              return (
                <section key={category} className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-display font-semibold capitalize">
                        {category}
                      </h2>
                      <p className="text-muted-foreground max-w-3xl">
                        {categoryDescriptions[category]}
                      </p>
                    </div>
                    <Badge variant="outline" className="px-4 py-1">
                      {categoryTemplates.length} templates
                    </Badge>
                  </div>

                  {categoryTemplates.length === 0 ? (
                    <div className="rounded-xl border border-dashed px-6 py-12 text-muted-foreground text-center">
                      Templates for this category are coming soon.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          id={template.id}
                          slug={template.slug}
                          title={template.title}
                          category={template.category}
                          price={template.price}
                          heroImage={template.heroImage}
                          onPreview={() =>
                            setLocation(`/templates/${template.slug}`)
                          }
                          onAddToCart={() =>
                            addToCartMutation.mutate(template.id)
                          }
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
