import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useApplyTheme } from "@/hooks/useApplyTheme";
import Index from "./pages/Index";
import ProductPage from "./pages/ProductPage";
import NotFound from "./pages/NotFound";
import LandingPageView from "./pages/LandingPageView";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import { RequireAuth } from "./hooks/useAuth";

const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminLandingPages = lazy(() => import("./pages/admin/AdminLandingPages"));
const AdminBundles = lazy(() => import("./pages/admin/AdminBundles"));
const AdminUpsells = lazy(() => import("./pages/admin/AdminUpsells"));
const AdminPostUpsell = lazy(() => import("./pages/admin/AdminPostUpsell"));
const AdminQtyOffers = lazy(() => import("./pages/admin/AdminQtyOffers"));
const AdminDiscounts = lazy(() => import("./pages/admin/AdminDiscounts"));
const AdminExitIntent = lazy(() => import("./pages/admin/AdminExitIntent"));
const AdminAbandoned = lazy(() => import("./pages/admin/AdminAbandoned"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminPageBuilder = lazy(() => import("./pages/admin/AdminPageBuilder"));
const AdminThemeEditor = lazy(() => import("./pages/admin/AdminThemeEditor"));
const AdminCheckoutPreview = lazy(() => import("./pages/admin/AdminCheckoutPreview"));
const AdminTrackingPixels = lazy(() => import("./pages/admin/AdminTrackingPixels"));

const queryClient = new QueryClient();

function AdminFallback() {
  return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading…</div>;
}

const App = () => {
  useApplyTheme();
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/offer/:slug" element={<LandingPageView />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
            <Route index element={<Suspense fallback={<AdminFallback />}><AdminOverview /></Suspense>} />
            <Route path="products" element={<Suspense fallback={<AdminFallback />}><AdminProducts /></Suspense>} />
            <Route path="orders" element={<Suspense fallback={<AdminFallback />}><AdminOrders /></Suspense>} />
            <Route path="landing-pages" element={<Suspense fallback={<AdminFallback />}><AdminLandingPages /></Suspense>} />
            <Route path="bundles" element={<Suspense fallback={<AdminFallback />}><AdminBundles /></Suspense>} />
            <Route path="upsells" element={<Suspense fallback={<AdminFallback />}><AdminUpsells /></Suspense>} />
            <Route path="post-upsell" element={<Suspense fallback={<AdminFallback />}><AdminPostUpsell /></Suspense>} />
            <Route path="qty-offers" element={<Suspense fallback={<AdminFallback />}><AdminQtyOffers /></Suspense>} />
            <Route path="discounts" element={<Suspense fallback={<AdminFallback />}><AdminDiscounts /></Suspense>} />
            <Route path="exit-intent" element={<Suspense fallback={<AdminFallback />}><AdminExitIntent /></Suspense>} />
            <Route path="abandoned" element={<Suspense fallback={<AdminFallback />}><AdminAbandoned /></Suspense>} />
            <Route path="analytics" element={<Suspense fallback={<AdminFallback />}><AdminAnalytics /></Suspense>} />
            <Route path="page-builder" element={<Suspense fallback={<AdminFallback />}><AdminPageBuilder /></Suspense>} />
            <Route path="theme" element={<Suspense fallback={<AdminFallback />}><AdminThemeEditor /></Suspense>} />
            <Route path="checkout-preview" element={<Suspense fallback={<AdminFallback />}><AdminCheckoutPreview /></Suspense>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
