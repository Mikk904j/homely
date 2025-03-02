
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Check if user has a household
      try {
        const { data: memberData, error: memberError } = await supabase
          .from('member_households')
          .select('household_id')
          .maybeSingle();

        if (memberError) {
          console.error('Error checking household membership:', memberError);
          // Still allow login with a warning about household status
          toast({
            title: "Logged in with warning",
            description: "Your household information couldn't be retrieved",
            variant: "destructive",
          });
          navigate("/household-setup");
          return;
        }

        // Navigate based on household membership
        if (memberData?.household_id) {
          navigate("/");
          toast({
            title: "Welcome back!",
            description: "Successfully logged in",
          });
        } else {
          navigate("/household-setup");
          toast({
            title: "Welcome!",
            description: "Please set up or join a household",
          });
        }
      } catch (memberCheckError) {
        console.error('Unexpected error checking membership:', memberCheckError);
        navigate("/household-setup");
        toast({
          title: "Logged in with warning",
          description: "Your household information couldn't be verified",
        });
      }
    } catch (error: any) {
      let errorMessage = "Check your email and password";
      
      if (error.message) {
        if (error.message.includes("Invalid login")) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Please verify your email before logging in";
        } else {
          errorMessage = error.message;
        }
      }
      
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
        />
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
        />
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
};
