import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Package,
  DollarSign,
  Eye,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Template, AdminStats } from "@shared/schema";

interface AdminDashboardProps {
  onAddProduct?: () => void;
  onEditTemplate?: (template: Template) => void;
  onDeleteTemplate?: (template: Template) => void;
  onLogout?: () => void;
  products?: Template[];
  stats?: AdminStats | null;
}

const categoryLabels: Record<string, string> = {
  ecommerce: "E-Commerce",
  portfolio: "Portfolio",
  saas: "SaaS",
  restaurant: "Restaurant",
  corporate: "Corporate",
  fitness: "Fitness",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AdminDashboard({
  onAddProduct,
  onEditTemplate,
  onDeleteTemplate,
  onLogout,
  products = [],
  stats,
}: AdminDashboardProps) {
  const statCards = [
    {
      label: "Total Templates",
      value: stats ? stats.totalTemplates : products.length,
      icon: Package,
      color: "text-primary",
    },
    {
      label: "Published",
      value: stats
        ? stats.publishedTemplates
        : products.filter((p) => p.status === "published").length,
      icon: Eye,
      color: "text-blue-600",
    },
    {
      label: "Total Revenue",
      value: stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0),
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Orders",
      value: stats ? stats.totalOrders : 0,
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-4xl font-display font-bold mb-2"
              data-testid="text-dashboard-title"
            >
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your template marketplace
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onLogout && (
              <Button
                variant="outline"
                onClick={onLogout}
                data-testid="button-admin-logout"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </Button>
            )}
            <Button
              onClick={onAddProduct}
              size="lg"
              data-testid="button-add-product"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Template
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div
                  className="text-3xl font-bold font-display"
                  data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No products yet. Add your first template!</p>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover-elevate"
                    data-testid={`product-row-${product.id}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-24 bg-muted rounded-md" />
                      <div>
                        <h3
                          className="font-semibold"
                          data-testid={`text-product-title-${product.id}`}
                        >
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="secondary"
                            data-testid={`badge-category-${product.id}`}
                          >
                            {categoryLabels[product.category] ??
                              product.category}
                          </Badge>
                          <Badge
                            variant={
                              product.status === "published"
                                ? "default"
                                : "secondary"
                            }
                            data-testid={`badge-status-${product.id}`}
                          >
                            {product.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ${product.price}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-edit-${product.id}`}
                        onClick={() => onEditTemplate?.(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-delete-${product.id}`}
                        onClick={() => onDeleteTemplate?.(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
