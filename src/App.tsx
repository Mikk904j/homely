
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { AuthStateProvider } from "./hooks/use-auth-state";
import { HouseholdStatusProvider } from "./hooks/use-household-status"; 
import { Loading } from "./components/ui/loading";
import { AnimatePresence, motion } from "framer-motion";
import Index from "./pages/Index";
import Shopping from "./pages/Shopping";
import Calendar from "./pages/Calendar";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import Tickets from "./pages/Tickets";
import Auth from "./pages/Auth";
import HouseholdSetup from "./pages/HouseholdSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

interface PrivateRouteProps {
  children: React.ReactNode; 
  requireHousehold?: boolean;
}

const PrivateRoute = ({ children, requireHousehold = true }: PrivateRouteProps) => {
  const { user, loading, hasHousehold } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireHousehold && hasHousehold === false) {
    return <Navigate to="/household-setup" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Index />
          </PrivateRoute>
        }
      />
      <Route
        path="/shopping"
        element={
          <PrivateRoute>
            <Shopping />
          </PrivateRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <PrivateRoute>
            <Calendar />
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <PrivateRoute>
            <Tickets />
          </PrivateRoute>
        }
      />
      <Route
        path="/members"
        element={
          <PrivateRoute>
            <Members />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />
      <Route 
        path="/household-setup" 
        element={
          <PrivateRoute requireHousehold={false}>
            <HouseholdSetup />
          </PrivateRoute>
        } 
      />
      <Route path="/auth" element={<Auth />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthStateProvider>
      <HouseholdStatusProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </HouseholdStatusProvider>
    </AuthStateProvider>
  </QueryClientProvider>
);

export default App;
