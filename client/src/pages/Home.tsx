import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import CartModal from "@/components/CartModal";
import ThemeToggle from "@/components/ThemeToggle";
import ecommerceImage from '@assets/generated_images/E-commerce_template_preview_e1e23501.png';
import portfolioImage from '@assets/generated_images/Portfolio_template_preview_208b6b0d.png';
import saasImage from '@assets/generated_images/SaaS_landing_page_template_c22a17dc.png';
import restaurantImage from '@assets/generated_images/Restaurant_template_preview_002cc9df.png';
import corporateImage from '@assets/generated_images/Corporate_template_preview_f5c0aa6f.png';
import fitnessImage from '@assets/generated_images/Fitness_template_preview_c999bc94.png';

const mockProducts = [
  { id: 1, title: "Modern E-Commerce", category: "E-Commerce", price: 79, imageUrl: ecommerceImage },
  { id: 2, title: "Creative Portfolio", category: "Portfolio", price: 59, imageUrl: portfolioImage },
  { id: 3, title: "SaaS Landing Pro", category: "SaaS", price: 89, imageUrl: saasImage },
  { id: 4, title: "Restaurant Deluxe", category: "Restaurant", price: 69, imageUrl: restaurantImage },
  { id: 5, title: "Corporate Suite", category: "Corporate", price: 99, imageUrl: corporateImage },
  { id: 6, title: "Fitness Hub", category: "Fitness", price: 74, imageUrl: fitnessImage },
];

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Array<{ id: number; title: string; price: number; imageUrl: string }>>([]);

  const handleAddToCart = (productId: number) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product && !cartItems.find(item => item.id === productId)) {
      setCartItems([...cartItems, product]);
      console.log('Added to cart:', product);
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
    console.log('Removed from cart:', productId);
  };

  const handleCheckout = () => {
    console.log('Proceeding to checkout with items:', cartItems);
    alert('Checkout functionality will be implemented in the full app!');
  };

  return (
    <div className="min-h-screen">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      <Header 
        cartItemCount={cartItems.length}
        onCartClick={() => setCartOpen(true)}
      />
      
      <Hero />
      
      <ProductGrid 
        products={mockProducts}
        onPreview={(id) => console.log('Preview product', id)}
        onAddToCart={handleAddToCart}
      />
      
      <Footer />
      
      <CartModal
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
