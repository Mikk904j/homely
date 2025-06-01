
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuth } from "@/hooks/use-auth";
import { useHousehold } from "@/hooks/use-household";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, initialized } = useAuth();
  const { hasHousehold } = useHousehold();

  const from = (location.state as any)?.from?.pathname || "/";

  // Redirect authenticated users
  useEffect(() => {
    if (initialized && user) {
      if (hasHousehold === true) {
        navigate(from, { replace: true });
      } else if (hasHousehold === false) {
        navigate("/household-setup", { replace: true });
      }
    }
  }, [user, hasHousehold, initialized, navigate, from]);

  // Don't render if user is authenticated
  if (user) {
    return null;
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
