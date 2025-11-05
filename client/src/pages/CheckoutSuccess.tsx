import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { completeCheckout } from "@/lib/api";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return new URLSearchParams(window.location.search).get("session_id");
  }, []);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["checkout", "complete", sessionId],
    queryFn: async () => {
      if (!sessionId) {
        throw new Error("Missing Stripe session id");
      }
      return await completeCheckout(sessionId);
    },
    enabled: Boolean(sessionId),
    retry: false,
  });

  useEffect(() => {
    if (data) {
      queryClient.setQueryData(["cart"], data.cart);
    }
  }, [data, queryClient]);

  const handleReturnHome = () => setLocation("/");

  if (!sessionId) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <h1 className="text-4xl font-display font-bold mb-4">
          Unable to confirm payment
        </h1>
        <p className="text-muted-foreground mb-8">
          We could not identify your payment session. If you completed a
          payment, please contact support with your receipt.
        </p>
        <Button size="lg" onClick={handleReturnHome}>
          Back to home
        </Button>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <h1 className="text-3xl font-display font-semibold mb-3">
          Finalizing your order…
        </h1>
        <p className="text-muted-foreground">
          Please wait a moment while we confirm your payment with Stripe.
        </p>
      </div>
    );
  }

  if (isError) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to finalize your checkout. Please contact support.";
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <h1 className="text-4xl font-display font-bold mb-4">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mb-8">{message}</p>
        <Button size="lg" onClick={handleReturnHome}>
          Back to home
        </Button>
      </div>
    );
  }

  const { order } = data;

  return (
    <div className="max-w-3xl mx-auto py-24 px-4 text-center">
      <h1 className="text-4xl font-display font-bold mb-4">
        Payment successful
      </h1>
      <p className="text-muted-foreground mb-10">
        Thank you for your purchase! We’ve emailed the receipt and download
        instructions to the address provided at checkout.
      </p>

      <div className="bg-muted/40 border rounded-2xl text-left p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Order summary</h2>
          <ul className="space-y-3">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium">
                  {item.template.title} × {item.quantity}
                </span>
                <span className="font-semibold">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total paid</span>
          <span className="font-display text-2xl">${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-12">
        <Button
          variant="outline"
          size="lg"
          onClick={() => setLocation("/admin")}
        >
          View orders dashboard
        </Button>
        <Button size="lg" onClick={handleReturnHome}>
          Continue browsing templates
        </Button>
      </div>
    </div>
  );
}
