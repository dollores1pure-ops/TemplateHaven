import CartModal from '../CartModal';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ecommerceImage from '@assets/generated_images/E-commerce_template_preview_e1e23501.png';
import portfolioImage from '@assets/generated_images/Portfolio_template_preview_208b6b0d.png';

const mockItems = [
  { id: 1, title: "Modern E-Commerce", price: 79, imageUrl: ecommerceImage },
  { id: 2, title: "Creative Portfolio", price: 59, imageUrl: portfolioImage },
];

export default function CartModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open Cart</Button>
      <CartModal
        open={open}
        onOpenChange={setOpen}
        items={mockItems}
        onRemoveItem={(id) => console.log('Remove item', id)}
        onCheckout={() => console.log('Checkout clicked')}
      />
    </div>
  );
}
