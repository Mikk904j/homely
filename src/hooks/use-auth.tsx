
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasHousehold: boolean | null;
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
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          
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
          });
        } else {
          setState({
            user: null,
            session: null,
            loading: false,
            hasHousehold: null,
          });
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to verify your login status. Please try refreshing the page.",
          variant: "destructive",
        });
        setState({
          user: null,
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
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("Session exists but no user found during auth state change");
          return;
        }

        const hasHousehold = await checkHouseholdStatus(user.id);

        setState({
          user,
          session,
          loading: false,
          hasHousehold,
        });
      } else {
        setState({
          user: null,
          session: null,
          loading: false,
          hasHousehold: null,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign Out Error",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const refreshHouseholdStatus = async () => {
    if (!state.user) return;
    
    try {
      const hasHousehold = await checkHouseholdStatus(state.user.id);
      
      setState(prev => ({
        ...prev,
        hasHousehold
      }));
    } catch (error) {
      console.error("Error refreshing household status:", error);
      toast({
        title: "Error",
        description: "Failed to refresh your household status. Please try again.",
        variant: "destructive",
      });
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
