
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useHousehold } from "@/hooks/use-household";
import { GlobalLoading } from "@/components/ui/global-loading";

interface ProtectedRouteProps {
  children: ReactNode;
  requireHousehold?: boolean;
}

export const ProtectedRoute = ({ children, requireHousehold = true }: ProtectedRouteProps) => {
  const { user, loading: authLoading, initialized } = useAuth();
  const { hasHousehold, loading: householdLoading } = useHousehold();
  const location = useLocation();

  console.log("ProtectedRoute check:", { 
    user: !!user, 
    initialized, 
    authLoading, 
    hasHousehold, 
    householdLoading, 
    requireHousehold 
  });

  // Show loading while auth is initializing
  if (!initialized || authLoading) {
    return <GlobalLoading message="Checking authentication..." />;
  }

  // Redirect to auth if no user
  if (!user) {
    console.log("No user, redirecting to auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Show loading while checking household status (only if household is required)
  if (requireHousehold && householdLoading) {
    return <GlobalLoading message="Checking household status..." />;
  }

  // Redirect to household setup if required but not present
  if (requireHousehold && hasHousehold === false) {
    console.log("No household, redirecting to household setup");
    return <Navigate to="/household-setup" replace />;
  }

  console.log("ProtectedRoute: Allowing access to", location.pathname);
  return <>{children}</>;
};
