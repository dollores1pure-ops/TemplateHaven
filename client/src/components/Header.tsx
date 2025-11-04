import { ShoppingCart, Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
}

export default function Header({ cartItemCount = 0, onCartClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" data-testid="link-home">
              <span className="text-2xl font-display font-bold tracking-tight hover-elevate active-elevate-2 px-3 py-2 rounded-md cursor-pointer">
                TemplateHub
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" data-testid="link-templates">
                <Button variant="ghost" size="sm" data-testid="button-templates">
                  Templates
                </Button>
              </Link>
              <Link href="/categories" data-testid="link-categories">
                <Button variant="ghost" size="sm" data-testid="button-categories">
                  Categories
                </Button>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {searchOpen ? (
              <div className="w-64 animate-in slide-in-from-right">
                <Input
                  type="search"
                  placeholder="Search templates..."
                  className="w-full"
                  data-testid="input-search"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
                data-testid="button-search"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center" data-testid="text-cart-count">
                  {cartItemCount}
                </span>
              )}
            </Button>

            <Link href="/admin" data-testid="link-admin">
              <Button variant="ghost" size="icon" data-testid="button-admin">
                <User className="h-5 w-5" />
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
