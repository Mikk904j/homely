
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle } from "lucide-react";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (data.session) {
          // User is already logged in, check if they have a household
          try {
            const { data: memberData, error: memberError } = await supabase
              .from('member_households')
              .select('household_id')
              .eq('user_id', data.session.user.id)
              .maybeSingle();

            if (memberError) {
              console.error("Error checking household:", memberError);
              // Continue to auth page if we can't check household status
              setIsLoading(false);
              return;
            }

            // Redirect based on household status
            navigate(memberData?.household_id ? "/" : "/household-setup");
          } catch (err) {
            console.error("Error in household check:", err);
            setIsLoading(false);
          }
        } else {
          // No active session, just show the auth page
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Auth check error:", err);
        setError(err.message || "Failed to verify authentication status");
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        // Will handle the redirection
        checkAuth();
      }
    });

    return () => {
      // Clean up the subscription
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  if (isLoading) {
    return <Loading fullScreen text="Checking authentication status..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold">Authentication Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto pt-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to HomeHarmony</h1>
        <p className="text-muted-foreground">
          {activeTab === "login"
            ? "Sign in to your account to continue"
            : "Create an account to get started"}
        </p>
      </div>

      <Card className="p-6">
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
  );
};

export default Auth;
