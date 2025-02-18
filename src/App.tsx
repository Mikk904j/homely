
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import Shopping from "./pages/Shopping";
import Calendar from "./pages/Calendar";
import Members from "./pages/Members";
import Settings from "./pages/Settings";
import Tickets from "./pages/Tickets";
import Auth from "./pages/Auth";
import HouseholdSetup from "./pages/HouseholdSetup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface AuthState {
  session: any;
  loading: boolean;
  hasHousehold: boolean | null;
}

const PrivateRoute = ({ children, requireHousehold = true }: { children: React.ReactNode, requireHousehold?: boolean }) => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    loading: true,
    hasHousehold: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Check if user has a household
          const { data: memberData } = await supabase
            .from("member_households")
            .select("household_id")
            .single();

          setAuthState({
            session,
            loading: false,
            hasHousehold: !!memberData,
          });
        } else {
          setAuthState({
            session: null,
            loading: false,
            hasHousehold: null,
          });
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        setAuthState({
          session: null,
          loading: false,
          hasHousehold: null,
        });
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: memberData } = await supabase
          .from("member_households")
          .select("household_id")
          .single();

        setAuthState({
          session,
          loading: false,
          hasHousehold: !!memberData,
        });
      } else {
        setAuthState({
          session: null,
          loading: false,
          hasHousehold: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authState.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!authState.session) {
    return <Navigate to="/auth" replace />;
  }

  if (requireHousehold && !authState.hasHousehold) {
    return <Navigate to="/household-setup" replace />;
  }

  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
