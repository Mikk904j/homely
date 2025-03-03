
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  user: any;
  session: any;
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          
          // Check if user has a household
          const { data: memberData } = await supabase
            .from("member_households")
            .select("household_id")
            .maybeSingle();

          setState({
            user,
            session,
            loading: false,
            hasHousehold: !!memberData,
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
        
        const { data: memberData } = await supabase
          .from("member_households")
          .select("household_id")
          .maybeSingle();

        setState({
          user,
          session,
          loading: false,
          hasHousehold: !!memberData,
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
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshHouseholdStatus = async () => {
    if (!state.user) return;
    
    try {
      const { data: memberData } = await supabase
        .from("member_households")
        .select("household_id")
        .maybeSingle();

      setState(prev => ({
        ...prev,
        hasHousehold: !!memberData
      }));
    } catch (error) {
      console.error("Error refreshing household status:", error);
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
