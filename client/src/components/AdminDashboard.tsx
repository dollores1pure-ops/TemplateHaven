import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Package,
  DollarSign,
  Eye,
  TrendingUp,
  LogOut,
  Crown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Template, AdminStats } from "@shared/schema";
import type { UserAccount } from "@/lib/api";

interface AdminDashboardProps {
  onAddProduct?: () => void;
  onEditTemplate?: (template: Template) => void;
  onDeleteTemplate?: (template: Template) => void;
  onLogout?: () => void;
  products?: Template[];
  stats?: AdminStats | null;
  users?: UserAccount[];
  onTogglePremium?: (user: UserAccount) => void;
  updatingUserId?: string | null;
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
  users = [],
  onTogglePremium,
  updatingUserId,
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

  const formatPremiumUntil = (value: string | null) => {
    if (!value) {
      return "—";
    }

    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(new Date(value));
    } catch {
      return "—";
    }
  };

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
                            {categoryLabels[product.category] ?? product.category}
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

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              User Premium Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No registered users yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Username</th>
                      <th className="py-2 pr-4 font-medium">Role</th>
                      <th className="py-2 pr-4 font-medium">Premium</th>
                      <th className="py-2 pr-4 font-medium">Valid Until</th>
                      <th className="py-2 pr-0 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-t border-border/60"
                        data-testid={`admin-user-row-${user.id}`}
                      >
                        <td className="py-3 pr-4 font-medium">{user.username}</td>
                        <td className="py-3 pr-4 capitalize">{user.role}</td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant={user.isPremium ? "default" : "outline"}
                            className={
                              user.isPremium ? "bg-amber-500 text-amber-50" : ""
                            }
                          >
                            {user.isPremium ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {formatPremiumUntil(user.premiumUntil)}
                        </td>
                        <td className="py-3 pr-0 text-right">
                          <Button
                            size="sm"
                            variant={user.isPremium ? "outline" : "default"}
                            onClick={() => onTogglePremium?.(user)}
                            disabled={updatingUserId === user.id}
                          >
                            {user.isPremium ? "Revoke" : "Grant"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
