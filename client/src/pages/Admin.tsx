import { useState } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminDashboard from "@/components/AdminDashboard";
import AdminProductForm from "@/components/AdminProductForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const ADMIN_PASSWORD = "admin123";

const mockProducts = [
  { id: 1, title: "Modern E-Commerce", category: "E-Commerce", price: 79, status: "published" },
  { id: 2, title: "Creative Portfolio", category: "Portfolio", price: 59, status: "published" },
  { id: 3, title: "SaaS Landing Pro", category: "SaaS", price: 89, status: "draft" },
];

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  const handleLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      console.log('Login successful');
    } else {
      alert('Incorrect password. Try: admin123');
      console.log('Login failed');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <AdminLogin onLogin={handleLogin} />
      </>
    );
  }

  if (showProductForm) {
    return (
      <>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <div className="fixed top-4 left-4 z-50">
          <Button 
            variant="outline" 
            onClick={() => setShowProductForm(false)}
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <AdminProductForm />
      </>
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <AdminDashboard 
        products={mockProducts}
        onAddProduct={() => setShowProductForm(true)}
      />
    </>
  );
}
