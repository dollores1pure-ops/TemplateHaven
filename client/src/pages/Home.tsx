import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CartModal from "@/components/CartModal";
import ThemeToggle from "@/components/ThemeToggle";
import type { Template, TemplateCategory } from "@shared/schema";
import {
  addCartItem,
  checkoutCart,
  fetchCart,
  fetchTemplates,
  removeCartItem,
  updateCartItem,
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type CategoryFilter = "all" | TemplateCategory;

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleNavigateHome = () => {
    setSelectedCategory("all");
    setSearchInput("");
    setSearchTerm("");
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 250);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const {
    data: templatesResponse,
    isLoading: templatesLoading,
    isError: templatesError,
  } = useQuery({
    queryKey: ["templates", { search: searchTerm, category: selectedCategory }],
    queryFn: () =>
      fetchTemplates({
        search: searchTerm || undefined,
        category: selectedCategory,
        status: "published",
      }),
  });

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
  });

  const templates: Template[] = templatesResponse?.data ?? [];

  const cartItemCount = useMemo(
    () => cartData?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cartData?.items],
  );

  const addToCartMutation = useMutation({
    mutationFn: (templateId: string) => addCartItem(templateId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["cart"], updatedCart);
      setCartOpen(true);
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

  const updateCartMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      if (quantity <= 0) {
        return await removeCartItem(itemId);
      }
      return await updateCartItem(itemId, quantity);
    },
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(["cart"], updatedCart);
    },
    onError: (error: unknown) => {
      toast({
        title: "Unable to update cart",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: checkoutCart,
    onSuccess: ({ url }) => {
      setCartOpen(false);
      if (url) {
        window.location.href = url;
      } else {
        toast({
          title: "Unable to start checkout",
          description:
            "We could not generate a payment session. Please try again.",
          variant: "destructive",
        });
      }
    },
    onError: (error: unknown) => {
      toast({
        title: "Checkout failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePreview = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setLocation(`/templates/${template.slug}`);
    }
  };

  const handleAddToCart = (templateId: string) => {
    addToCartMutation.mutate(templateId);
  };

  const handleRemoveFromCart = (itemId: string) => {
    updateCartMutation.mutate({ itemId, quantity: 0 });
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateCartMutation.mutate({ itemId, quantity });
  };

  const handleCheckout = () => {
    checkoutMutation.mutate();
  };

  const isLoadingState = templatesLoading;
  const showErrorState = templatesError;

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <Header
        cartItemCount={cartItemCount}
        onCartClick={() => setCartOpen(true)}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onNavigateHome={handleNavigateHome}
      />

      <Hero />

      {showErrorState ? (
        <div className="max-w-3xl mx-auto my-16 text-center">
          <h2 className="text-3xl font-display font-bold mb-2">
            Unable to load templates
          </h2>
          <p className="text-muted-foreground">
            Please refresh the page or try again later.
          </p>
        </div>
      ) : isLoadingState ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center text-muted-foreground">
          Loading templates...
        </div>
      ) : (
        <ProductGrid
          products={templates}
          onPreview={handlePreview}
          onAddToCart={handleAddToCart}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      )}

      <Footer />

      <CartModal
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartData?.items}
        subtotal={cartData?.subtotal}
        onRemoveItem={handleRemoveFromCart}
        onUpdateItemQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
        checkoutLoading={checkoutMutation.isPending}
      />
    </div>
  );
}
