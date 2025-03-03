
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasHousehold: boolean | null;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  refreshHouseholdStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    hasHousehold: null,
    error: null
  });
  const { toast } = useToast();

  const checkHouseholdStatus = async (userId: string) => {
    try {
      const { data: memberData, error } = await supabase
        .from("member_households")
        .select("household_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking household status:", error);
        return null;
      }

      return !!memberData;
    } catch (error) {
      console.error("Unexpected error checking household status:", error);
      return null;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
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

          // Check if user has a household
          const hasHousehold = await checkHouseholdStatus(user.id);

          setState({
            user,
            session,
            loading: false,
            hasHousehold,
            error: null
          });
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
            hasHousehold: null,
            error: null
          });
        }
      } catch (error: any) {
        console.error("Error checking auth state:", error);
        setState({
          user: null,
          session: null,
          loading: false,
          hasHousehold: null,
          error: error.message || "Authentication error"
        });
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            throw userError;
          }
          
          if (!user) {
            throw new Error("Session exists but no user found during auth state change");
          }

          const hasHousehold = await checkHouseholdStatus(user.id);

          setState({
            user,
            session,
            loading: false,
            hasHousehold,
            error: null
          });
        } catch (error: any) {
          console.error("Error during auth state change:", error);
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message || "Authentication error"
          }));
        }
      } else {
        setState({
          user: null,
          session: null,
          loading: false,
          hasHousehold: null,
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

  const refreshHouseholdStatus = async () => {
    if (!state.user) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const hasHousehold = await checkHouseholdStatus(state.user.id);
      
      setState(prev => ({
        ...prev,
        hasHousehold,
        loading: false
      }));
    } catch (error: any) {
      console.error("Error refreshing household status:", error);
      toast({
        title: "Error",
        description: "Failed to refresh your household status. Please try again.",
        variant: "destructive",
      });
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || "Failed to refresh household status" 
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      signOut,
      refreshHouseholdStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
