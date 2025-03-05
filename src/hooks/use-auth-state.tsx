
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

          setState({
            user,
            session,
            loading: false,
            error: null
          });
        } else {
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
      signOut
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
