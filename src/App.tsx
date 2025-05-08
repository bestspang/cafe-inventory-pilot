
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { StoresProvider } from "@/context/StoresContext";
import { LocaleProvider } from "@/context/LocaleContext";
import { seedDemoData } from "@/utils/seedDemoData";
import { IntlProvider } from "react-intl";
import enMessages from "@/messages/en.json";
import thMessages from "@/messages/th.json";

// Auth
import AuthGuard from "./components/auth/AuthGuard";
import Login from "./pages/Login";

// Layout
import AppLayout from "./components/layout/AppLayout";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import StockCheck from "./pages/StockCheck";
import Requests from "./pages/Requests";
import NewRequest from "./pages/NewRequest";
import QuickRequest from "./pages/QuickRequest";
import Branches from "./pages/Branches";
import ManageStaff from "./pages/ManageStaff";
import Settings from "./pages/Settings";
import ComingSoonPage from "./pages/ComingSoonPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

// Helper component to get locale from context and provide IntlProvider
const AppWithIntl = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useLocale();
  const messages = locale === 'th' ? thMessages : enMessages;
  
  return (
    <IntlProvider locale={locale} messages={messages} defaultLocale="en">
      {children}
    </IntlProvider>
  );
};

// We need to import useLocale here after defining AppWithIntl
import { useLocale } from "@/context/LocaleContext";

const App = () => {
  // Seed demo data on app initialization
  useEffect(() => {
    seedDemoData().catch(console.error);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <StoresProvider>
            <LocaleProvider>
              <AppWithIntl>
                <BrowserRouter>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    {/* Public routes - these don't require authentication */}
                    <Route path="/login" element={
                      <AuthGuard requireAuth={false} redirectTo="/dashboard">
                        <Login />
                      </AuthGuard>
                    } />
                    
                    <Route path="/quick-request" element={<QuickRequest />} />
                    
                    {/* Root route - determines where to go based on auth */}
                    <Route path="/" element={<Index />} />
                    
                    {/* Protected routes - require authentication */}
                    <Route element={<AuthGuard requireAuth={true}><AppLayout /></AuthGuard>}>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="inventory" element={<Inventory />} />
                      <Route path="stock-check" element={<StockCheck />} />
                      <Route path="requests" element={<Requests />} />
                      <Route path="requests/new" element={<NewRequest />} />
                      <Route path="branches" element={<Branches />} />
                      <Route path="manage-staff" element={<ManageStaff />} />
                      <Route path="settings" element={<Settings />} />
                      
                      {/* Coming Soon Pages */}
                      <Route path="suppliers" element={<ComingSoonPage />} />
                      <Route path="purchase-orders" element={<ComingSoonPage />} />
                      <Route path="reports" element={<ComingSoonPage />} />
                      <Route path="users" element={<ComingSoonPage />} />
                      <Route path="profile" element={<ComingSoonPage />} />
                      
                      {/* Catch-all for other routes */}
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </AppWithIntl>
            </LocaleProvider>
          </StoresProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
