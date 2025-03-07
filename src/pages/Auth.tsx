
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, hasHousehold, loading: authLoading } = useAuth();

  // This retains the original URL the user was trying to access
  const from = (location.state as any)?.from?.pathname || "/";

  // Initial check for authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLocalLoading(true);
        setLocalError(null);
        
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (data.session) {
          console.log("User is already logged in, checking household status");
        }
        
        // Always stop the loading state after a maximum of 5 seconds
        const timer = setTimeout(() => {
          setLocalLoading(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      } catch (err: any) {
        console.error("Auth check error:", err);
        setLocalError(err.message || "Failed to verify authentication status");
        setLocalLoading(false);
      }
    };

    // Initial check
    checkAuth();
    
    // Set a max timeout to prevent infinite loading
    const maxTimeout = setTimeout(() => {
      setLocalLoading(false);
    }, 5000);
    
    return () => clearTimeout(maxTimeout);
  }, []);

  // When auth state is determined, redirect if needed
  useEffect(() => {
    if (!authLoading && user) {
      console.log("User is authenticated, hasHousehold:", hasHousehold);
      
      // Force auth check to complete in a reasonable time
      setTimeout(() => {
        if (hasHousehold === true) {
          navigate(from, { replace: true });
        } else if (hasHousehold === false) {
          navigate("/household-setup", { replace: true });
        }
      }, 500);
    } else {
      // Ensure we exit loading state after a maximum time
      setTimeout(() => {
        setLocalLoading(false);
      }, 3000);
    }
  }, [user, hasHousehold, authLoading, navigate, from]);

  if (localLoading && authLoading) {
    return <Loading fullScreen text="Checking authentication status..." />;
  }

  if (localError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold">Authentication Error</h2>
            <p className="text-muted-foreground">{localError}</p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to HomeHarmony</h1>
          <p className="text-muted-foreground">
            {activeTab === "login"
              ? "Sign in to your account to continue"
              : "Create an account to get started"}
          </p>
        </div>

        <Card className="p-6 shadow-lg">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
