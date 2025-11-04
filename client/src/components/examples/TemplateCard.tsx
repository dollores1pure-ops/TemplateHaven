import TemplateCard from '../TemplateCard';
import ecommerceImage from '@assets/generated_images/E-commerce_template_preview_e1e23501.png';

export default function TemplateCardExample() {
  return (
    <div className="p-6 max-w-sm">
      <TemplateCard
        id={1}
        title="Modern E-Commerce"
        category="E-Commerce"
        price={79}
        imageUrl={ecommerceImage}
        onPreview={() => console.log('Preview clicked')}
        onAddToCart={() => console.log('Added to cart')}
      />
    </div>
  );
}
