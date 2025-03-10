import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshHouseholdStatus } = useAuth();

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      console.log("Attempting login with email:", formData.email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) throw error;

      console.log("Login successful, checking household status");
      
      await refreshHouseholdStatus();

      const from = (location.state as any)?.from?.pathname || "/";
      
      navigate(from, { replace: true });
      toast({
        title: "Welcome back!",
        description: "Successfully logged in",
      });
    } catch (error: any) {
      let errorMessage = "Invalid email or password";
      
      if (error.message) {
        if (error.message.includes("Invalid login")) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email before logging in";
        } else if (error.message.includes("Too many attempts")) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else {
          errorMessage = error.message;
        }
      }
      
      console.error("Login error:", error);
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          required
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Enter your email"
          disabled={isLoading}
          className={errors.email ? "border-red-300" : ""}
        />
        {errors.email && (
          <div className="flex items-center text-red-500 text-sm mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.email}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <Input
          required
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, password: e.target.value }))
          }
          placeholder="Enter your password"
          disabled={isLoading}
          minLength={6}
          className={errors.password ? "border-red-300" : ""}
        />
        {errors.password && (
          <div className="flex items-center text-red-500 text-sm mt-1">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.password}
          </div>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
