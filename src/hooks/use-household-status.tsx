
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
      
      // For RLS infinite recursion errors, assume user has no household
      if (error.message?.includes("infinite recursion") || error.message?.includes("Failed to check your household membership")) {
        console.log("RLS policy error detected, defaulting to no household");
        setState({
          hasHousehold: false,
          loading: false,
          error: null // Don't set error to avoid UI confusion
        });
        return;
      }
      
      // Handle other errors but don't get stuck in loading state
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
    
    // Force resolve loading state after 5 seconds maximum (reduced from 8)
    const timeoutId = setTimeout(() => {
      setState(prev => {
        if (prev.loading) {
          console.log("HouseholdStatusProvider: Force resolving loading state after timeout");
          return {
            ...prev,
            loading: false,
            hasHousehold: false, // Assume no household after timeout
            error: prev.error || null // Don't show error to user
          };
        }
        return prev;
      });
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [user, loadHouseholdStatus]);

  const refreshHouseholdStatus = async (): Promise<void> => {
    if (!user) return;
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log("Manually refreshing household status for user:", user.id);
      
      // Add delay to ensure DB consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const hasHousehold = await checkUserHasHousehold();
        console.log("Manual refresh result:", hasHousehold);
        
        setState(prev => ({
          ...prev,
          hasHousehold,
          loading: false
        }));
      } catch (error: any) {
        // For RLS infinite recursion errors, assume user has no household
        if (error.message?.includes("infinite recursion") || error.message?.includes("Failed to check your household membership")) {
          console.log("RLS policy error detected during refresh, defaulting to no household");
          setState({
            hasHousehold: false,
            loading: false,
            error: null
          });
          return;
        }
        
        throw error; // Re-throw for other errors
      }
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
        error: error.message || "Failed to refresh household status",
        hasHousehold: false // Default to no household on error
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
