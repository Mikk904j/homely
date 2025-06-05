
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./use-auth";
import { checkUserHasHousehold } from "@/services/household/get-household";

interface HouseholdState {
  hasHousehold: boolean | null;
  loading: boolean;
  error: string | null;
}

interface HouseholdContextType extends HouseholdState {
  refreshHouseholdStatus: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(undefined);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HouseholdState>({
    hasHousehold: null,
    loading: false,
    error: null
  });
  const { user, initialized } = useAuth();
  const { toast } = useToast();

  const loadHouseholdStatus = useCallback(async () => {
    if (!user) {
      setState({
        hasHousehold: null,
        loading: false,
        error: null
      });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log("Checking household status for user:", user.id);
      const hasHousehold = await checkUserHasHousehold();
      console.log("Household status result:", hasHousehold);

      setState({
        hasHousehold,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error("Error loading household status:", error);
      
      // Default to false on any error to prevent infinite loading
      setState({
        hasHousehold: false,
        loading: false,
        error: null // Don't show error to avoid confusing users
      });
    }
  }, [user]);

  // Load household status when auth is initialized and user changes
  useEffect(() => {
    if (initialized) {
      loadHouseholdStatus();
    }
  }, [initialized, user, loadHouseholdStatus]);

  const refreshHouseholdStatus = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log("Manually refreshing household status for user:", user.id);
      
      const hasHousehold = await checkUserHasHousehold();
      console.log("Manual refresh result:", hasHousehold);
      
      setState({
        hasHousehold,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error("Error refreshing household status:", error);
      setState({
        hasHousehold: false,
        loading: false,
        error: null // Don't show error to avoid confusing users
      });
      
      toast({
        title: "Unable to verify household status",
        description: "Please try refreshing the page if issues persist.",
        variant: "destructive",
      });
    }
  };

  return (
    <HouseholdContext.Provider value={{ 
      ...state,
      refreshHouseholdStatus
    }}>
      {children}
    </HouseholdContext.Provider>
  );
}

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (context === undefined) {
    throw new Error("useHousehold must be used within a HouseholdProvider");
  }
  return context;
};
