
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { AuthStateProvider } from "./hooks/use-auth-state";
import { HouseholdStatusProvider } from "./hooks/use-household-status"; 
import { Loading } from "./components/ui/loading";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import Shopping from "./pages/Shopping";
import Calendar from "./pages/Calendar";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import Tickets from "./pages/Tickets";
import Auth from "./pages/Auth";
import HouseholdSetup from "./pages/HouseholdSetup";
import NotFound from "./pages/NotFound";
import { AppShell } from "./components/AppShell";
import { Button } from "./components/ui/button";
import { RefreshCcw } from "lucide-react";

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
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [criticalTimeout, setCriticalTimeout] = useState(false);
  
  // Set timeouts to handle cases where auth check takes too long
  useEffect(() => {
    let timer: number | undefined;
    let criticalTimer: number | undefined;
    
    if (loading) {
      // First timeout for user feedback
      timer = window.setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000); // 3 seconds timeout
      
      // Second timeout for critical fail case
      criticalTimer = window.setTimeout(() => {
        setCriticalTimeout(true);
      }, 10000); // 10 seconds timeout
    } else {
      // Reset timeouts when loading completes
      setLoadingTimeout(false);
      setCriticalTimeout(false);
    }
    
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(criticalTimer);
    };
  }, [loading]);

  // If we hit critical timeout, provide a reload option
  if (criticalTimeout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Check Failed</h2>
        <p className="mb-6 text-muted-foreground">
          We're having trouble verifying your authentication status.
        </p>
        <Button onClick={() => window.location.reload()} className="flex items-center">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reload Application
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <Loading 
        fullScreen 
        text={loadingTimeout 
          ? "Checking authentication is taking longer than expected..." 
          : "Checking authentication..."}
      />
    );
  }

  if (!user) {
    console.log("No authenticated user found, redirecting to auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireHousehold && hasHousehold === false) {
    console.log("User has no household, redirecting to setup");
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

const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  useEffect(() => {
    let timer: number | undefined;
    
    if (loading) {
      timer = window.setTimeout(() => {
        setLoadingTimeout(true);
      }, 3000); // 3 seconds timeout
    } else {
      setLoadingTimeout(false);
    }
    
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);
  
  useEffect(() => {
    if (!loading && !user && location.pathname !== "/auth") {
      console.log("AuthCheck: No user found, redirecting to auth from", location.pathname);
      navigate("/auth", { state: { from: location }, replace: true });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return <Loading 
      fullScreen 
      text={loadingTimeout 
        ? "Authentication check is taking longer than expected..." 
        : "Checking authentication status..."} 
    />;
  }

  // Only show AppShell for authenticated routes
  if (user && location.pathname !== "/auth" && location.pathname !== "/household-setup") {
    return (
      <AppShell sidebarOpen={sidebarOpen} onSidebarOpenChange={setSidebarOpen}>
        {children}
      </AppShell>
    );
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <AuthCheck>
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
    </AuthCheck>
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
