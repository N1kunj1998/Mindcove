import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ThankYou from "./pages/ThankYou";
import ATSScanning from "./pages/ATSScanning";
import ATSResults from "./pages/ATSResults";
import ATSOptimize from "./pages/ATSOptimize";
import ATSOptimizePreview from "./pages/ATSOptimizePreview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/order-confirmed-7k9m2p4x8q" element={<ThankYou />} />
          <Route path="/ats-analysis/scanning" element={<ATSScanning />} />
          <Route path="/ats-analysis/results" element={<ATSResults />} />
          <Route path="/ats-analysis/optimize" element={<ATSOptimize />} />
          <Route path="/ats-analysis/preview" element={<ATSOptimizePreview />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
