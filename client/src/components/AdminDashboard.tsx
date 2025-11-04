import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, DollarSign, Eye, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminDashboardProps {
  onAddProduct?: () => void;
  products?: Array<{
    id: number;
    title: string;
    category: string;
    price: number;
    status: string;
  }>;
}

export default function AdminDashboard({ onAddProduct, products = [] }: AdminDashboardProps) {
  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "text-primary" },
    { label: "Total Revenue", value: "$12,450", icon: DollarSign, color: "text-green-600" },
    { label: "Total Views", value: "45.2K", icon: Eye, color: "text-blue-600" },
    { label: "Conversion", value: "3.2%", icon: TrendingUp, color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2" data-testid="text-dashboard-title">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your template marketplace</p>
          </div>
          <Button onClick={onAddProduct} size="lg" data-testid="button-add-product">
            <Plus className="h-5 w-5 mr-2" />
            Add New Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-display" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
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
                        <h3 className="font-semibold" data-testid={`text-product-title-${product.id}`}>
                          {product.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" data-testid={`badge-category-${product.id}`}>
                            {product.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">${product.price}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${product.id}`}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-delete-${product.id}`}>
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
