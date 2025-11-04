# Website Template Marketplace - Design Guidelines

## Design Approach
**Reference-Based Approach** drawing inspiration from premium digital marketplaces like ThemeForest, Creative Market, and Stripe's product showcase pages, combined with the sophistication of Webflow's template gallery. This marketplace demands exceptional visual presentation since the product itself is design.

## Core Design Principles
- **Premium Showcase**: Every template preview must look stunning and clickable
- **Trust & Credibility**: Professional polish that makes buyers confident
- **Effortless Discovery**: Intuitive browsing with powerful filtering
- **Admin Efficiency**: Streamlined product management workflow

## Typography System
**Primary Font**: Inter or Plus Jakarta Sans (Google Fonts)
**Secondary Font**: Space Grotesk for headings (adds personality)

**Hierarchy**:
- Hero Headline: 4xl to 6xl, font-bold, tracking-tight
- Section Headers: 3xl to 4xl, font-bold
- Product Titles: xl to 2xl, font-semibold
- Body Text: base to lg, font-normal, leading-relaxed
- UI Labels: sm, font-medium, uppercase tracking-wide
- Prices: 2xl to 3xl, font-bold, tabular-nums

## Layout System
**Spacing Primitives**: Tailwind units of 3, 4, 6, 8, 12, 16, 20
- Micro spacing (badges, tags): p-2, gap-2
- Component padding: p-4 to p-6
- Section spacing: py-12 to py-20 (mobile to desktop)
- Grid gaps: gap-6 to gap-8
- Container max-width: max-w-7xl with px-6

## Storefront Layout

### Hero Section (80vh)
Large background image showing stunning website templates in action with subtle overlay gradient. Hero content positioned left-aligned or centered with:
- Bold headline emphasizing quality templates
- Subheading about simplicity and professional design
- Primary CTA button with backdrop-blur-xl bg-white/10 treatment
- Trust indicators (number of templates, customers, rating)

### Product Grid Section
Masonry or standard grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) featuring:
- Large template preview cards with hover lift effect (scale-105 transition)
- Preview image with 16:10 aspect ratio
- Template name, category badge, price overlay
- Quick view button appears on hover
- Live preview and details buttons

### Filter Sidebar (Desktop) / Top Bar (Mobile)
- Category chips with active states
- Price range slider
- Feature tags (Responsive, E-commerce, Dark Mode, etc.)
- Sort dropdown (Newest, Popular, Price)

### Product Detail Page
Full-width hero image of template (aspect-video), followed by:
- Two-column layout: Left (template info, features list, description), Right (sticky purchase card with price, CTA, preview links)
- Image gallery grid (grid-cols-2 md:grid-cols-3) showing multiple template views
- Video preview section with aspect-video container
- Feature highlights with icon grid (grid-cols-2 lg:grid-cols-3)
- Related templates carousel at bottom

## Admin Panel Layout

### Dashboard Overview
- Stats cards in grid-cols-1 md:grid-cols-2 lg:grid-cols-4 (Total Products, Revenue, Recent Sales, Views)
- Recent activity feed
- Quick actions panel

### Product Management
Full-width table with actions column, featuring:
- Product thumbnail, name, category, price, status, edit/delete actions
- Add New Product button (prominent, top-right)

### Product Creation/Edit Form
Clean two-column form layout (lg:grid-cols-2):
- Left column: Basic info (name, description, price, category)
- Right column: Media uploads (images drag-drop zone, video URL input)
- Full-width rich text editor for detailed description
- Tag input with autocomplete chips
- Preview section showing live template card preview
- Action buttons: Save Draft, Publish, Cancel

## Component Library

### Navigation
**Storefront Header**: 
- Full-width with backdrop-blur, sticky positioning
- Logo left, navigation center (Home, Templates, Categories), cart/admin right
- Search bar with icon (expands on focus)

**Admin Header**:
- Sidebar toggle, page title, user menu right
- Breadcrumb navigation below header

### Cards
**Template Card**:
- Image container with aspect-ratio
- Overlay gradient on hover revealing quick actions
- Card footer with title, category badge, price
- Border with subtle shadow, rounded-xl

**Stats Card** (Admin):
- Icon in rounded-lg container
- Large number (3xl, font-bold)
- Label text and trend indicator
- p-6, rounded-xl, border

### Forms
**Input Fields**:
- Floating labels or top-aligned labels
- Focus ring with offset
- Helper text below in text-sm
- Error states with icon and message

**Image Upload Zone**:
- Dashed border, rounded-lg
- Large upload icon and "Drag & drop or click to upload" text
- Preview grid below showing uploaded images with remove buttons
- p-8 to p-12 spacing

### Buttons
**Primary CTA**: Large (px-8 py-4), rounded-full or rounded-lg, font-semibold, shadow-lg
**Secondary**: Outlined variant with border-2
**Ghost**: Transparent with hover background
**Sizes**: sm (px-4 py-2), base (px-6 py-3), lg (px-8 py-4)

### Modals/Overlays
**Quick View Modal**:
- Centered, max-w-4xl
- Template preview image, key info, primary CTA
- Close button top-right
- Backdrop blur with opacity

**Admin Confirmation Dialogs**:
- max-w-md, centered
- Icon, heading, description, action buttons
- Danger actions use warning styling

## Icons
**Font Awesome** (via CDN) for comprehensive icon coverage including:
- Shopping cart, user, search, upload, edit, trash
- Category icons, feature indicators
- Social proof icons

## Images

### Hero Section
Large, high-quality image (1920x1080) showing beautiful template previews in browser mockups, or designer workspace with multiple screens displaying stunning templates. Gradient overlay from bottom ensuring text readability.

### Product Cards
Template screenshots in desktop browser mockup (1600x1000 source), displayed at 16:10 aspect ratio, showing homepage or most impressive page of template.

### Product Detail Page
- Hero image: Full template homepage screenshot (1920x1200)
- Gallery images: 6-8 additional template page screenshots showing different sections/pages
- Lifestyle images optional: Designer workspace, team collaboration (if relevant to brand story)

### Admin Panel
- Dashboard: Optional chart/graph visualizations for analytics
- Placeholder images for empty states (no products, no sales)

## Animations
Minimal and purposeful:
- Card hover: subtle scale (scale-105) with smooth transition (300ms)
- Button hover: slight brightness increase
- Page transitions: fade-in for modals
- Image loading: skeleton shimmer effect
- NO scroll animations, parallax, or decorative motion

## Accessibility
- Maintain 4.5:1 contrast ratios for all text
- Focus indicators on all interactive elements (ring-2, ring-offset-2)
- Alt text for all template preview images describing template type/purpose
- Keyboard navigation for filters, product grid, and forms
- ARIA labels for icon-only buttons
- Form validation with clear error messages

## Responsive Breakpoints
- Mobile (base): Single column, stacked navigation, bottom sheet filters
- Tablet (md: 768px): Two-column grids, visible sidebar
- Desktop (lg: 1024px): Three-column grids, full feature set
- Large (xl: 1280px): Optimal viewing, max-w-7xl container

This marketplace prioritizes stunning visual presentation while maintaining exceptional usability for both shoppers and administrators.