
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useHousehold } from "@/hooks/use-household";
import { householdService } from "@/services/household";
import { validateInviteCode, normalizeInviteCode } from "@/utils/household";

interface JoinHouseholdState {
  inviteCode: string;
  isLoading: boolean;
  step: 'form' | 'success';
  householdName: string;
  error: string | null;
}

export function useJoinHousehold() {
  const [state, setState] = useState<JoinHouseholdState>({
    inviteCode: "",
    isLoading: false,
    step: 'form',
    householdName: "",
    error: null
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshHouseholdStatus } = useHousehold();

  const setInviteCode = (code: string) => {
    setState(prev => ({
      ...prev,
      inviteCode: code,
      error: null
    }));
  };

  const validateInput = () => {
    const normalizedCode = normalizeInviteCode(state.inviteCode);
    
    if (!normalizedCode) {
      setState(prev => ({
        ...prev,
        error: "Please enter an invite code"
      }));
      
      toast({
        title: "Input Required",
        description: "Please enter an invite code",
        variant: "destructive",
      });
      return false;
    }
    
    if (!validateInviteCode(normalizedCode)) {
      setState(prev => ({
        ...prev,
        error: "Invalid invite code format"
      }));
      
      toast({
        title: "Invalid Format",
        description: "The invite code format is invalid. It should be 8 characters (letters A-Z and numbers 2-9)",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleJoinHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) {
      return;
    }

    if (!user) {
      setState(prev => ({ ...prev, error: "You must be logged in to join a household" }));
      toast({
        title: "Authentication Error",
        description: "You must be logged in to join a household",
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
      const normalizedCode = normalizeInviteCode(state.inviteCode);
      const result = await householdService.joinHousehold({
        inviteCode: normalizedCode,
        userId: user.id
      });
      
      // Success!
      setState(prev => ({
        ...prev,
        householdName: result.householdName,
        step: 'success',
        isLoading: false,
        error: null
      }));
      
      // Refresh the household status immediately
      await refreshHouseholdStatus();
      console.log("Household status refreshed after joining");
      
      toast({
        title: "Success!",
        description: `You've joined "${result.householdName}"`,
      });
      
    } catch (error: any) {
      console.error("Error joining household:", error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to join household"
      }));
      
      toast({
        title: "Error",
        description: error.message || "Failed to join household. Please check your invite code and try again.",
        variant: "destructive",
      });
    }
  };

  const handleContinue = () => {
    navigate("/");
  };

  return {
    inviteCode: state.inviteCode,
    setInviteCode,
    isLoading: state.isLoading,
    step: state.step,
    householdName: state.householdName,
    error: state.error,
    handleJoinHousehold,
    handleContinue
  };
}
