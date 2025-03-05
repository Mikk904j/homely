
import { createContext, useContext, ReactNode } from "react";
import { useAuthState } from "./use-auth-state";
import { useHouseholdStatus } from "./use-household-status";

interface AuthContextType {
  user: any;
  loading: boolean;
  error: string | null;
  hasHousehold: boolean | null;
  refreshHouseholdStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, error } = useAuthState();
  const { 
    hasHousehold, 
    loading: householdLoading, 
    refreshHouseholdStatus 
  } = useHouseholdStatus();

  const loading = authLoading || householdLoading;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        hasHousehold,
        refreshHouseholdStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
