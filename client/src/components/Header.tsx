import { ShoppingCart, Search, Menu, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useEffect, useState } from "react";

interface HeaderProps {
  cartItemCount?: number;
  onCartClick?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onNavigateHome?: () => void;
}

export default function Header({
  cartItemCount = 0,
  onCartClick,
  searchValue,
  onSearchChange,
  onNavigateHome,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (searchValue && searchValue.trim().length > 0) {
      setSearchOpen(true);
    }
  }, [searchValue]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" data-testid="link-home">
              <span
                className="text-2xl font-display font-bold tracking-tight hover-elevate active-elevate-2 px-3 py-2 rounded-md cursor-pointer"
                onClick={onNavigateHome}
              >
                TemplateHub
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link href="/" data-testid="link-templates">
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-templates"
                  onClick={onNavigateHome}
                >
                  Templates
                </Button>
              </Link>
              <Link href="/categories" data-testid="link-categories">
                <Button
                  variant="ghost"
                  size="sm"
                  data-testid="button-categories"
                >
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
                  value={searchValue ?? ""}
                  onChange={(event) => onSearchChange?.(event.target.value)}
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
                  <span
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
                    data-testid="text-cart-count"
                  >
                    {cartItemCount}
                  </span>
                )}
              </Button>

              <div className="hidden md:flex items-center gap-2">
                <Link href="/login" data-testid="link-login">
                  <Button variant="ghost" size="sm" data-testid="button-login">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" data-testid="link-signup">
                  <Button size="sm" data-testid="button-signup">
                    Sign up
                  </Button>
                </Link>
              </div>

              <Link
                href="/login"
                data-testid="link-login-mobile"
                className="md:hidden"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Log in"
                  data-testid="button-login-mobile"
                >
                  <LogIn className="h-5 w-5" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                data-testid="button-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
