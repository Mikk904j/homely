
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
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 5000);
      });
      
      // Race between actual check and timeout
      const hasHousehold = await Promise.race([
        checkUserHasHousehold(),
        timeoutPromise
      ]);

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
      
      // Add timeout for refresh operations too
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 5000);
      });
      
      const hasHousehold = await Promise.race([
        checkUserHasHousehold(),
        timeoutPromise
      ]);
      
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
