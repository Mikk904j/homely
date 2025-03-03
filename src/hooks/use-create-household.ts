
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateInviteCode } from "@/utils/household";
import { useAuth } from "@/hooks/use-auth";

type HouseholdTheme = "default" | "warm" | "cool";
type CreateHouseholdStep = 'info' | 'success';

interface CreateHouseholdState {
  householdName: string;
  householdTheme: HouseholdTheme;
  isLoading: boolean;
  step: CreateHouseholdStep;
  inviteCode: string;
}

export function useCreateHousehold() {
  const [state, setState] = useState<CreateHouseholdState>({
    householdName: "",
    householdTheme: "default",
    isLoading: false,
    step: 'info',
    inviteCode: "",
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshHouseholdStatus } = useAuth();

  const setHouseholdName = (name: string) => {
    setState(prev => ({ ...prev, householdName: name }));
  };

  const setHouseholdTheme = (theme: HouseholdTheme) => {
    setState(prev => ({ ...prev, householdTheme: theme }));
  };

  const validateHouseholdInput = () => {
    const trimmedName = state.householdName.trim();
    
    if (!trimmedName) {
      toast({
        title: "Input Required",
        description: "Please enter a household name",
        variant: "destructive",
      });
      return false;
    }
    
    if (trimmedName.length > 50) {
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
    
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      console.log("Creating household for user:", user.id);

      // Create the household within a transaction-like approach
      const householdResult = await createHouseholdInDb(user.id);
      
      // Set success state
      setState(prev => ({
        ...prev,
        step: 'success',
        inviteCode: householdResult.inviteCode,
        isLoading: false
      }));
      
      // Refresh the user's household status
      await refreshHouseholdStatus();
      
      toast({
        title: "Success!",
        description: "Your household has been created.",
      });
    } catch (error: any) {
      console.error("Household creation failed:", error);
      
      setState(prev => ({ ...prev, isLoading: false }));
      
      toast({
        title: "Error",
        description: error.message || "Failed to create household. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createHouseholdInDb = async (userId: string) => {
    // Create the household
    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({
        name: state.householdName.trim(),
        created_by: userId,
        theme: state.householdTheme,
      })
      .select("id, name")
      .single();

    if (householdError) {
      console.error("Household creation error:", householdError);
      throw new Error(`Failed to create household: ${householdError.message}`);
    }

    const householdId = household.id;
    console.log("Household created:", household);

    try {
      // Add the user as an admin member
      const { error: memberError } = await supabase
        .from("member_households")
        .insert({
          user_id: userId,
          household_id: householdId,
          role: "admin",
        });

      if (memberError) {
        console.error("Member creation error:", memberError);
        // If adding the member fails, clean up the household
        await supabase
          .from("households")
          .delete()
          .eq("id", householdId);
        
        throw new Error(`Failed to add you to household: ${memberError.message}`);
      }

      // Generate and create an invite code
      const generatedInviteCode = generateInviteCode();
      const { error: inviteError } = await supabase
        .from("household_invites")
        .insert({
          household_id: householdId,
          code: generatedInviteCode,
          created_by: userId,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          uses_remaining: 10
        });

      if (inviteError) {
        console.error("Invite creation error:", inviteError);
        // Non-fatal error, just log it
        toast({
          title: "Invite Code Issue",
          description: "Household created but there was an issue generating an invite code.",
          variant: "default",
        });
        return { householdId, inviteCode: "" };
      }

      return { householdId, inviteCode: generatedInviteCode };
    } catch (error) {
      // If any error occurs after household creation, try to clean up
      await supabase
        .from("households")
        .delete()
        .eq("id", householdId);
      
      throw error;
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
    handleCreateHousehold,
    handleContinue
  };
}
