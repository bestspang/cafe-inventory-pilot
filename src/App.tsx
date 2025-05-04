
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { DemoModeProvider } from "@/context/DemoModeContext";

// Layout
import AppLayout from "./components/layout/AppLayout";
import DemoModeBanner from "./components/layout/DemoModeBanner";

// Auth
import Login from "./pages/Login";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import StockCheck from "./pages/StockCheck";
import Requests from "./pages/Requests";
import NewRequest from "./pages/NewRequest";
import ComingSoonPage from "./pages/ComingSoonPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoModeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DemoModeBanner />
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="stock-check" element={<StockCheck />} />
                <Route path="requests" element={<Requests />} />
                <Route path="requests/new" element={<NewRequest />} />
                
                {/* Coming Soon Pages */}
                <Route path="suppliers" element={<ComingSoonPage />} />
                <Route path="purchase-orders" element={<ComingSoonPage />} />
                <Route path="branches" element={<ComingSoonPage />} />
                <Route path="reports" element={<ComingSoonPage />} />
                <Route path="users" element={<ComingSoonPage />} />
                <Route path="settings" element={<ComingSoonPage />} />
                <Route path="profile" element={<ComingSoonPage />} />
                
                {/* Catch-all for other routes */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </DemoModeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
