
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { validateInviteCode, normalizeInviteCode } from "@/utils/household";
import { useAuth } from "@/hooks/use-auth";

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
  const { refreshHouseholdStatus } = useAuth();

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
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      const normalizedCode = normalizeInviteCode(state.inviteCode);
      
      // 1. Verify the invite code exists and is valid
      const { data: invite, error: inviteError } = await supabase
        .from("household_invites")
        .select("household_id, uses_remaining, expires_at")
        .eq("code", normalizedCode)
        .single();

      if (inviteError || !invite) {
        setState(prev => ({
          ...prev,
          error: "Invalid or expired invite code"
        }));
        throw new Error("Invalid or expired invite code");
      }

      // Check if the invite is expired
      if (new Date(invite.expires_at) < new Date()) {
        setState(prev => ({
          ...prev,
          error: "This invite code has expired"
        }));
        throw new Error("This invite code has expired");
      }

      // Check if there are uses remaining
      if (invite.uses_remaining !== null && invite.uses_remaining <= 0) {
        setState(prev => ({
          ...prev,
          error: "This invite code has reached its usage limit"
        }));
        throw new Error("This invite code has reached its usage limit");
      }

      // 2. Check if user is already a member of this household
      const { data: existingMembership, error: membershipCheckError } = await supabase
        .from("member_households")
        .select("id")
        .eq("household_id", invite.household_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingMembership) {
        setState(prev => ({
          ...prev,
          error: "You are already a member of this household"
        }));
        throw new Error("You are already a member of this household");
      }

      // 3. Get the household name for the success message
      const { data: household, error: householdError } = await supabase
        .from("households")
        .select("name")
        .eq("id", invite.household_id)
        .single();

      if (householdError) {
        throw new Error("Could not find the household");
      }

      // 4. Add the user as a member
      const { error: memberError } = await supabase
        .from("member_households")
        .insert({
          user_id: user.id,
          household_id: invite.household_id,
          role: "member",
        });

      if (memberError) {
        console.error("Error joining household:", memberError);
        throw new Error(`Failed to join household: ${memberError.message}`);
      }

      // 5. Decrement the uses_remaining if it's not null
      if (invite.uses_remaining !== null) {
        await supabase
          .from("household_invites")
          .update({ uses_remaining: invite.uses_remaining - 1 })
          .eq("code", normalizedCode);
      }

      // Success!
      setState(prev => ({
        ...prev,
        householdName: household.name,
        step: 'success',
        isLoading: false
      }));
      
      // Refresh the household status in the auth context
      await refreshHouseholdStatus();
      
      toast({
        title: "Success!",
        description: `You've joined "${household.name}"`,
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
