import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CheckoutCancel() {
  const [, setLocation] = useLocation();

  return (
    <div className="max-w-2xl mx-auto py-24 px-4 text-center">
      <h1 className="text-4xl font-display font-bold mb-4">
        Checkout canceled
      </h1>
      <p className="text-muted-foreground mb-8">
        Your payment was not completed. You can review your cart and try again
        whenever you’re ready.
      </p>
      <Button size="lg" onClick={() => setLocation("/")}>
        Back to browsing
      </Button>
    </div>
  );
}
