import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_workspace_with_templates_1d09c7e2.png";

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6" data-testid="text-hero-title">
            Premium Website Templates
            <span className="block text-primary mt-2">Built for Success</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-hero-subtitle">
            Discover our stunning collection of professionally designed templates. 
            Launch your website in minutes, not months.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="text-lg px-8" data-testid="button-browse">
              Browse Templates
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 backdrop-blur-sm bg-background/50" data-testid="button-learn-more">
              Learn More
            </Button>
          </div>
          
          <div className="flex items-center gap-8 mt-12 text-sm">
            <div data-testid="stat-templates">
              <div className="text-3xl font-bold font-display">150+</div>
              <div className="text-muted-foreground">Templates</div>
            </div>
            <div data-testid="stat-customers">
              <div className="text-3xl font-bold font-display">10k+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
            <div data-testid="stat-rating">
              <div className="text-3xl font-bold font-display">4.9/5</div>
              <div className="text-muted-foreground">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
