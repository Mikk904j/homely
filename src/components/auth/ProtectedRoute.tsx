
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

  // Show loading while auth is initializing
  if (!initialized || authLoading) {
    return <GlobalLoading message="Checking authentication..." />;
  }

  // Redirect to auth if no user
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Show loading while checking household status
  if (requireHousehold && householdLoading) {
    return <GlobalLoading message="Checking household status..." />;
  }

  // Redirect to household setup if required but not present
  if (requireHousehold && hasHousehold === false) {
    return <Navigate to="/household-setup" replace />;
  }

  return <>{children}</>;
};
