
import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuthState } from "./use-auth-state";
import { checkUserHasHousehold } from "@/services/household/get-household";

interface HouseholdStatusState {
  hasHousehold: boolean | null;
  loading: boolean;
  error: string | null;
}

interface HouseholdStatusContextType extends HouseholdStatusState {
  refreshHouseholdStatus: () => Promise<void>;
}

const HouseholdStatusContext = createContext<HouseholdStatusContextType | undefined>(undefined);

export function HouseholdStatusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HouseholdStatusState>({
    hasHousehold: null,
    loading: true,
    error: null
  });
  const { user } = useAuthState();
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

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const hasHousehold = await checkUserHasHousehold();

      setState({
        hasHousehold,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error("Error loading household status:", error);
      setState({
        hasHousehold: null,
        loading: false,
        error: error.message || "Failed to check household status"
      });
    }
  }, [user]);

  useEffect(() => {
    console.log("HouseholdStatusProvider: User changed, loading status");
    loadHouseholdStatus();
  }, [user, loadHouseholdStatus]);

  const refreshHouseholdStatus = async () => {
    if (!user) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const hasHousehold = await checkUserHasHousehold();
      
      setState(prev => ({
        ...prev,
        hasHousehold,
        loading: false
      }));

      return hasHousehold;
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
    <HouseholdStatusContext.Provider value={{ 
      ...state,
      refreshHouseholdStatus
    }}>
      {children}
    </HouseholdStatusContext.Provider>
  );
}

export const useHouseholdStatus = () => {
  const context = useContext(HouseholdStatusContext);
  if (context === undefined) {
    throw new Error("useHouseholdStatus must be used within a HouseholdStatusProvider");
  }
  return context;
};
