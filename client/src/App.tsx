import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import TemplateDetail from "@/pages/TemplateDetail";
import Categories from "@/pages/Categories";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import CheckoutCancel from "@/pages/CheckoutCancel";
import Products from "@/pages/Products";
import NewReleases from "@/pages/NewReleases";
import Company from "@/pages/Company";
import About from "@/pages/About";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Licenses from "@/pages/Licenses";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/categories" component={Categories} />
      <Route path="/new-releases" component={NewReleases} />
      <Route path="/company" component={Company} />
      <Route path="/about" component={About} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/licenses" component={Licenses} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/templates/:id" component={TemplateDetail} />
      <Route path="/admindash" component={Admin} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/checkout/cancel" component={CheckoutCancel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
