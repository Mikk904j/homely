
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./hooks/use-auth";
import { HouseholdProvider } from "./hooks/use-household";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { AppErrorBoundary } from "./components/ui/app-error-boundary";
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

const AppContent = () => {
  const location = useLocation();

  // Routes that don't need the AppLayout
  const authRoutes = ["/auth", "/household-setup"];
  const isAuthRoute = authRoutes.includes(location.pathname);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const routes = (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.3 }}
      >
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping"
            element={
              <ProtectedRoute>
                <Shopping />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <Tickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/household-setup" 
            element={
              <ProtectedRoute requireHousehold={false}>
                <HouseholdSetup />
              </ProtectedRoute>
            } 
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {routes}
      </div>
    );
  }

  return (
    <AppLayout>
      {routes}
    </AppLayout>
  );
};

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HouseholdProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </HouseholdProvider>
      </AuthProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
