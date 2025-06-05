
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useHousehold } from "@/hooks/use-household";
import { householdService } from "@/services/household";

type HouseholdTheme = "default" | "warm" | "cool";
type CreateHouseholdStep = 'info' | 'success';

interface CreateHouseholdState {
  householdName: string;
  householdDescription: string;
  householdTheme: HouseholdTheme;
  isLoading: boolean;
  step: CreateHouseholdStep;
  inviteCode: string;
  error: string | null;
}

export function useCreateHousehold() {
  const [state, setState] = useState<CreateHouseholdState>({
    householdName: "",
    householdDescription: "",
    householdTheme: "default",
    isLoading: false,
    step: 'info',
    inviteCode: "",
    error: null
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshHouseholdStatus } = useHousehold();

  const setHouseholdName = (name: string) => {
    setState(prev => ({ 
      ...prev, 
      householdName: name,
      error: null 
    }));
  };

  const setHouseholdDescription = (description: string) => {
    setState(prev => ({ 
      ...prev, 
      householdDescription: description,
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

    if (state.householdDescription && state.householdDescription.length > 200) {
      setState(prev => ({ ...prev, error: "Household description must be 200 characters or less" }));
      
      toast({
        title: "Description Too Long",
        description: "Household description must be 200 characters or less",
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
        description: state.householdDescription.trim(),
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
      
      // Refresh household status immediately
      await refreshHouseholdStatus();
      console.log("Household status refreshed after creation");
      
      toast({
        title: "Success!",
        description: "Your household has been created successfully.",
      });
    } catch (error: any) {
      console.error("Household creation failed:", error);
      
      let errorMessage = error.message || "Failed to create household. Please try again.";
      
      // Enhanced error handling
      if (errorMessage.includes("violates row level security")) {
        errorMessage = "Permission error. Please try logging out and back in.";
      } else if (errorMessage.includes("duplicate key")) {
        errorMessage = "A household with this name already exists. Please try a different name.";
      } else if (errorMessage.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: errorMessage
      }));
      
      toast({
        title: "Error",
        description: errorMessage,
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
    householdDescription: state.householdDescription,
    setHouseholdDescription,
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
