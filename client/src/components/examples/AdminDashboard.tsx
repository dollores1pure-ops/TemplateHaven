import AdminDashboard from '../AdminDashboard';

const mockProducts = [
  { id: 1, title: "Modern E-Commerce", category: "E-Commerce", price: 79, status: "published" },
  { id: 2, title: "Creative Portfolio", category: "Portfolio", price: 59, status: "published" },
  { id: 3, title: "SaaS Landing Pro", category: "SaaS", price: 89, status: "draft" },
];

export default function AdminDashboardExample() {
  return (
    <AdminDashboard 
      onAddProduct={() => console.log('Add product clicked')}
      products={mockProducts}
    />
  );
}
