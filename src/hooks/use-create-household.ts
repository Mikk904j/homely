
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { householdService } from "@/services/household";

type HouseholdTheme = "default" | "warm" | "cool";
type CreateHouseholdStep = 'info' | 'success';

interface CreateHouseholdState {
  householdName: string;
  householdTheme: HouseholdTheme;
  isLoading: boolean;
  step: CreateHouseholdStep;
  inviteCode: string;
  error: string | null;
}

export function useCreateHousehold() {
  const [state, setState] = useState<CreateHouseholdState>({
    householdName: "",
    householdTheme: "default",
    isLoading: false,
    step: 'info',
    inviteCode: "",
    error: null
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, refreshHouseholdStatus } = useAuth();

  const setHouseholdName = (name: string) => {
    setState(prev => ({ 
      ...prev, 
      householdName: name,
      error: null 
    }));
  };

  const setHouseholdTheme = (theme: HouseholdTheme) => {
    setState(prev => ({ ...prev, householdTheme: theme }));
  };

  const validateHouseholdInput = () => {
    const trimmedName = state.householdName.trim();
    
    if (!trimmedName) {
      setState(prev => ({ ...prev, error: "Please enter a household name" }));
      
      toast({
        title: "Input Required",
        description: "Please enter a household name",
        variant: "destructive",
      });
      return false;
    }
    
    if (trimmedName.length > 50) {
      setState(prev => ({ ...prev, error: "Household name must be 50 characters or less" }));
      
      toast({
        title: "Input Too Long",
        description: "Household name must be 50 characters or less",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateHouseholdInput()) {
      return;
    }

    if (!user) {
      setState(prev => ({ ...prev, error: "You must be logged in to create a household" }));
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a household",
        variant: "destructive",
      });
      return;
    }
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true,
      error: null
    }));

    try {
      console.log("Creating household with user ID:", user.id);
      
      const result = await householdService.createHousehold({
        name: state.householdName.trim(),
        theme: state.householdTheme,
        userId: user.id
      });
      
      console.log("Household created successfully:", result);

      // Set success state
      setState(prev => ({
        ...prev,
        step: 'success',
        inviteCode: result.inviteCode,
        isLoading: false,
        error: null
      }));
      
      // Add longer delay before refreshing household status to ensure database consistency
      setTimeout(async () => {
        try {
          // Try up to 3 times with increasing delays
          for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            await refreshHouseholdStatus();
            console.log(`Household status refresh attempt ${i + 1} completed`);
          }
        } catch (refreshError) {
          console.error("Failed to refresh household status:", refreshError);
        }
      }, 1000);
      
      toast({
        title: "Success!",
        description: "Your household has been created successfully.",
      });
    } catch (error: any) {
      console.error("Household creation failed:", error);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error.message || "Failed to create household. Please try again." 
      }));
      
      toast({
        title: "Error",
        description: error.message || "Failed to create household. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleContinue = () => {
    navigate("/");
  };

  return {
    householdName: state.householdName,
    setHouseholdName,
    householdTheme: state.householdTheme,
    setHouseholdTheme,
    isLoading: state.isLoading,
    step: state.step,
    inviteCode: state.inviteCode,
    error: state.error,
    handleCreateHousehold,
    handleContinue
  };
}
