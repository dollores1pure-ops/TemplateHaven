import ProductGrid from '../ProductGrid';
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

export default function ProductGridExample() {
  return (
    <ProductGrid 
      products={mockProducts}
      onPreview={(id) => console.log('Preview', id)}
      onAddToCart={(id) => console.log('Add to cart', id)}
    />
  );
}
