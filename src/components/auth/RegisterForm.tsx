
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    };

    // Validate email
    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    // Validate first name
    if (!formData.firstName) {
      errors.firstName = "First name is required";
      isValid = false;
    }

    // Validate last name
    if (!formData.lastName) {
      errors.lastName = "Last name is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Invalid form data",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        try {
          // Update the profile with first and last name
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              first_name: formData.firstName,
              last_name: formData.lastName,
            })
            .eq('id', authData.user.id);

          if (profileError) throw profileError;

          // Check if email confirmation is required
          if (authData.session) {
            // User is signed in immediately (email confirmation not required)
            toast({
              title: "Registration successful!",
              description: "Welcome to HomeHarmony! Please set up or join a household.",
            });
            navigate("/household-setup");
          } else {
            // Email confirmation is required
            toast({
              title: "Registration successful!",
              description: "Please check your email to confirm your account before logging in.",
            });
            navigate("/auth"); // Stay on auth page but show success message
          }
        } catch (profileError: any) {
          console.error("Profile update error:", profileError);
          // Even if profile update fails, registration succeeded
          toast({
            title: "Registration successful with warning",
            description: "Account created, but profile information couldn't be saved. You can update it later.",
          });
          navigate("/auth");
        }
      }
    } catch (error: any) {
      let errorMessage = "Registration failed";
      
      if (error.message) {
        if (error.message.includes("already registered")) {
          errorMessage = "This email is already registered. Please log in instead.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Registration failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">First Name</label>
          <Input
            required
            value={formData.firstName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, firstName: e.target.value }))
            }
            placeholder="Enter your first name"
            disabled={isLoading}
          />
          {formErrors.firstName && (
            <p className="text-xs text-red-500">{formErrors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Last Name</label>
          <Input
            required
            value={formData.lastName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, lastName: e.target.value }))
            }
            placeholder="Enter your last name"
            disabled={isLoading}
          />
          {formErrors.lastName && (
            <p className="text-xs text-red-500">{formErrors.lastName}</p>
          )}
        </div>
      </div>
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
        {formErrors.email && (
          <p className="text-xs text-red-500">{formErrors.email}</p>
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
          placeholder="Create a password"
          minLength={6}
          disabled={isLoading}
        />
        {formErrors.password && (
          <p className="text-xs text-red-500">{formErrors.password}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Password must be at least 6 characters long
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
};
