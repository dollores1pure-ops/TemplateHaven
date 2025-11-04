import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ThemeToggle from "@/components/ThemeToggle";
import { addCartItem, fetchTemplate } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, ArrowLeft } from "lucide-react";

export default function TemplateDetail() {
  const [, params] = useRoute("/templates/:id");
  const templateId = params?.id ?? "";
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const templateQuery = useQuery({
    queryKey: ["template", templateId],
    queryFn: () => fetchTemplate(templateId),
    enabled: Boolean(templateId),
  });

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

  const template = templateQuery.data;

  if (templateQuery.isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="max-w-5xl mx-auto px-6 py-24 text-center text-muted-foreground">
          Loading template...
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-display font-bold mb-4">
            Template not found
          </h1>
          <p className="text-muted-foreground mb-6">
            The template you are looking for may have been removed or is
            unavailable.
          </p>
          <Button asChild>
            <Link href="/">Return to marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCartMutation.mutate(template.id);
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to templates
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            {template.liveDemoUrl && (
              <Button asChild variant="outline">
                <a
                  href={template.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Live Demo
                </a>
              </Button>
            )}
            {template.figmaUrl && (
              <Button asChild variant="outline">
                <a
                  href={template.figmaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Figma File
                </a>
              </Button>
            )}
            <Button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8 items-start">
          <div className="space-y-6">
            <img
              src={template.heroImage}
              alt={template.title}
              className="w-full rounded-2xl shadow-sm"
            />

            <section>
              <h2 className="text-2xl font-display font-semibold mb-4">
                Gallery
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {template.galleryImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${template.title} preview ${index + 1}`}
                    className="w-full rounded-xl object-cover"
                  />
                ))}
              </div>
            </section>

            {template.videoUrl && (
              <section>
                <h2 className="text-2xl font-display font-semibold mb-4">
                  Video Preview
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden">
                  <iframe
                    src={template.videoUrl}
                    title={`${template.title} video preview`}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Badge variant="secondary" className="w-fit">
                  {template.category}
                </Badge>
                <h1 className="text-3xl font-display font-bold">
                  {template.title}
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
                <div className="text-4xl font-display font-bold">
                  ${template.price}
                </div>
              </CardContent>
            </Card>

            {template.features.length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">Key Features</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {template.tags.length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
