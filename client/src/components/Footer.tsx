import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-display font-bold text-xl mb-4" data-testid="text-footer-brand">
              TemplateHub
            </h3>
            <p className="text-muted-foreground text-sm">
              Premium website templates for modern businesses and creators.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-products">Products</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/templates" data-testid="link-footer-templates"><span className="hover:text-foreground cursor-pointer">Templates</span></Link></li>
              <li><Link href="/categories" data-testid="link-footer-categories"><span className="hover:text-foreground cursor-pointer">Categories</span></Link></li>
              <li><Link href="/new" data-testid="link-footer-new"><span className="hover:text-foreground cursor-pointer">New Releases</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-company">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" data-testid="link-footer-about"><span className="hover:text-foreground cursor-pointer">About</span></Link></li>
              <li><Link href="/contact" data-testid="link-footer-contact"><span className="hover:text-foreground cursor-pointer">Contact</span></Link></li>
              <li><Link href="/careers" data-testid="link-footer-careers"><span className="hover:text-foreground cursor-pointer">Careers</span></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4" data-testid="text-footer-legal">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" data-testid="link-footer-privacy"><span className="hover:text-foreground cursor-pointer">Privacy Policy</span></Link></li>
              <li><Link href="/terms" data-testid="link-footer-terms"><span className="hover:text-foreground cursor-pointer">Terms of Service</span></Link></li>
              <li><Link href="/licenses" data-testid="link-footer-licenses"><span className="hover:text-foreground cursor-pointer">Licenses</span></Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p data-testid="text-footer-copyright">© 2024 TemplateHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
