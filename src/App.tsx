
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { BookingProvider } from "@/contexts/BookingContext";
import Index from "./pages/Index";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import MyReservations from "./pages/MyReservations";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import PaymentResult from "./pages/PaymentResult";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

import ScrollToTop from "@/components/ScrollToTop";

const App = () => (
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <CurrencyProvider>
            <BookingProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <div className="font-inter antialiased text-foreground bg-background selection:bg-gold-start/20 min-h-screen">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/minhas-reservas" element={<MyReservations />} />
                      <Route path="/my-reservations" element={<MyReservations />} />
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/payment-result" element={<PaymentResult />} />
                      <Route path="/blog/trilhas-mindelo" element={<BlogPost />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </BrowserRouter>
              </TooltipProvider>
            </BookingProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);

export default App;
