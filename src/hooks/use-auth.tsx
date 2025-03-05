
import { ReactNode } from "react";
import { AuthStateProvider, useAuthState } from "./use-auth-state";
import { HouseholdStatusProvider, useHouseholdStatus } from "./use-household-status";

interface AuthContextType {
  user: ReturnType<typeof useAuthState>["user"];
  session: ReturnType<typeof useAuthState>["session"];
  loading: boolean;
  hasHousehold: ReturnType<typeof useHouseholdStatus>["hasHousehold"];
  error: string | null;
  signOut: ReturnType<typeof useAuthState>["signOut"];
  refreshHouseholdStatus: ReturnType<typeof useHouseholdStatus>["refreshHouseholdStatus"];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthStateProvider>
      <HouseholdStatusProvider>
        {children}
      </HouseholdStatusProvider>
    </AuthStateProvider>
  );
}

export const useAuth = (): AuthContextType => {
  const { user, session, loading: authLoading, error: authError, signOut } = useAuthState();
  const { 
    hasHousehold, 
    loading: householdLoading, 
    error: householdError,
    refreshHouseholdStatus 
  } = useHouseholdStatus();

  // Combine loading states
  const loading = authLoading || householdLoading;
  
  // Prioritize auth errors over household errors
  const error = authError || householdError;

  return {
    user,
    session,
    loading,
    hasHousehold,
    error,
    signOut,
    refreshHouseholdStatus
  };
};
