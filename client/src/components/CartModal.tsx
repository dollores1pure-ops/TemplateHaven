import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, X } from "lucide-react";

interface CartItem {
  id: number;
  title: string;
  price: number;
  imageUrl: string;
}

interface CartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items?: CartItem[];
  onRemoveItem?: (id: number) => void;
  onCheckout?: () => void;
}

export default function CartModal({
  open,
  onOpenChange,
  items = [],
  onRemoveItem,
  onCheckout,
}: CartModalProps) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2" data-testid="text-cart-title">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
          </SheetTitle>
          <SheetDescription>
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground" data-testid="text-cart-empty">
                Your cart is empty
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-lg border hover-elevate"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-20 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-1" data-testid={`text-cart-item-title-${item.id}`}>
                      {item.title}
                    </h4>
                    <p className="text-lg font-bold font-display mt-1" data-testid={`text-cart-item-price-${item.id}`}>
                      ${item.price}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem?.(item.id)}
                    data-testid={`button-remove-${item.id}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <>
            <Separator className="my-4" />
            <SheetFooter className="flex-col gap-4 sm:flex-col">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold font-display text-2xl tabular-nums" data-testid="text-cart-total">
                  ${total}
                </span>
              </div>
              <Button size="lg" className="w-full" onClick={onCheckout} data-testid="button-checkout">
                Proceed to Checkout
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
