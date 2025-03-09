
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
      
      console.log("Checking household status for user:", user.id);
      // Add a small delay to ensure DB consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const hasHousehold = await checkUserHasHousehold();
      console.log("Household status check result:", hasHousehold);

      setState({
        hasHousehold,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error("Error loading household status:", error);
      
      // Handle the error but don't get stuck in loading state
      setState({
        hasHousehold: false, // Assume no household on error
        loading: false,
        error: error.message || "Failed to check household status"
      });
      
      // Non-blocking toast for error
      toast({
        title: "Connection issue",
        description: "Couldn't verify household status. Please try refreshing.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    console.log("HouseholdStatusProvider: User changed, loading status");
    
    // Only try to load status if we have a user
    if (user) {
      loadHouseholdStatus();
    } else {
      // Reset state when no user is present
      setState({
        hasHousehold: null,
        loading: false,
        error: null
      });
    }
    
    // Force resolve loading state after 8 seconds maximum
    const timeoutId = setTimeout(() => {
      setState(prev => {
        if (prev.loading) {
          console.log("HouseholdStatusProvider: Force resolving loading state after timeout");
          return {
            ...prev,
            loading: false,
            error: prev.error || "Request timed out"
          };
        }
        return prev;
      });
    }, 8000);
    
    return () => clearTimeout(timeoutId);
  }, [user, loadHouseholdStatus]);

  const refreshHouseholdStatus = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log("Manually refreshing household status for user:", user.id);
      
      // Add delay to ensure DB consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      const hasHousehold = await checkUserHasHousehold();
      console.log("Manual refresh result:", hasHousehold);
      
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
