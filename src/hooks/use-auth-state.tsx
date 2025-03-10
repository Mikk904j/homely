
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  clearAuthCookies: () => Promise<void>;
}

const AuthStateContext = createContext<AuthContextType | undefined>(undefined);

export function AuthStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  });
  const { toast } = useToast();

  // Function to clear auth cookies
  const clearAuthCookies = async () => {
    try {
      console.log("Attempting to clear auth cookies");
      
      // Force clear the session
      await supabase.auth.signOut({ scope: "local" });
      
      // Reset state 
      setState({
        user: null,
        session: null,
        loading: false,
        error: null
      });
      
      // Clear browser localStorage related to Supabase auth
      localStorage.removeItem("supabase.auth.token");
      
      // Display notification to the user
      toast({
        title: "Session Reset",
        description: "Your authentication session has been reset due to a timeout.",
      });
      
      console.log("Auth cookies successfully cleared");
    } catch (error: any) {
      console.error("Error clearing auth cookies:", error);
      toast({
        title: "Error",
        description: "Failed to reset your session. Please try refreshing the page.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (session) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            throw userError;
          }
          
          if (!user) {
            throw new Error("Session exists but no user found");
          }

          console.log("User authenticated:", user.id);
          setState({
            user,
            session,
            loading: false,
            error: null
          });
        } else {
          console.log("No active session found");
          setState({
            user: null,
            session: null,
            loading: false,
            error: null
          });
        }
      } catch (error: any) {
        console.error("Error checking auth state:", error);
        setState({
          user: null,
          session: null,
          loading: false,
          error: error.message || "Authentication error"
        });
        
        toast({
          title: "Authentication Error",
          description: error.message || "There was a problem verifying your authentication status",
          variant: "destructive",
        });
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed, event:", _event);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      if (session) {
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            throw userError;
          }
          
          if (!user) {
            throw new Error("Session exists but no user found during auth state change");
          }

          console.log("User authenticated after state change:", user.id);
          setState({
            user,
            session,
            loading: false,
            error: null
          });
        } catch (error: any) {
          console.error("Error during auth state change:", error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message || "Authentication error"
          }));
          
          toast({
            title: "Authentication Error",
            description: error.message || "There was a problem with your authentication session",
            variant: "destructive",
          });
        }
      } else {
        console.log("User signed out or session expired");
        setState({
          user: null,
          session: null,
          loading: false,
          error: null
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Reset state on successful logout
      setState({
        user: null,
        session: null,
        loading: false,
        error: null
      });
      
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Error",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || "Failed to sign out" 
      }));
    }
  };

  return (
    <AuthStateContext.Provider value={{ 
      ...state,
      signOut,
      clearAuthCookies
    }}>
      {children}
    </AuthStateContext.Provider>
  );
}

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error("useAuthState must be used within an AuthStateProvider");
  }
  return context;
};
