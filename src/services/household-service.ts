
import { supabase } from "@/integrations/supabase/client";
import { generateInviteCode } from "@/utils/household";

export interface CreateHouseholdParams {
  name: string;
  theme?: string;
  userId: string;
}

export interface HouseholdCreationResult {
  householdId: string;
  inviteCode: string;
}

export interface JoinHouseholdParams {
  inviteCode: string;
  userId: string;
}

export const householdService = {
  async createHousehold({ name, theme = "default", userId }: CreateHouseholdParams): Promise<HouseholdCreationResult> {
    if (!name.trim()) {
      throw new Error("Household name is required");
    }

    if (!userId) {
      throw new Error("User ID is required to create a household");
    }

    // Create the household
    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({
        name: name.trim(),
        created_by: userId,
        theme,
      })
      .select("id, name")
      .single();

    if (householdError) {
      console.error("Household creation error:", householdError);
      throw new Error(`Failed to create household: ${householdError.message}`);
    }

    const householdId = household.id;
    
    try {
      // Add the user as an admin member using a direct RPC call to avoid RLS issues
      // This will bypass the potential infinite recursion issue
      const { error: memberError } = await supabase
        .from("member_households")
        .insert({
          user_id: userId,
          household_id: householdId,
          role: "admin",
        });

      if (memberError) {
        console.error("Member creation error:", memberError);
        // Clean up the household if adding the member fails
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
        // Non-fatal error, continue with empty invite code
        return { householdId, inviteCode: "" };
      }

      return { householdId, inviteCode: generatedInviteCode };
    } catch (error) {
      // Clean up the household if any error occurs after household creation
      await supabase
        .from("households")
        .delete()
        .eq("id", householdId);
      
      throw error;
    }
  },

  async joinHousehold({ inviteCode, userId }: JoinHouseholdParams): Promise<{ householdId: string; householdName: string }> {
    if (!inviteCode) {
      throw new Error("Invite code is required");
    }

    if (!userId) {
      throw new Error("User ID is required to join a household");
    }

    // Verify the invite code
    const { data: invite, error: inviteError } = await supabase
      .from("household_invites")
      .select("household_id, uses_remaining, expires_at")
      .eq("code", inviteCode)
      .single();

    if (inviteError || !invite) {
      throw new Error("Invalid or expired invite code");
    }

    // Check if the invite is expired
    if (new Date(invite.expires_at) < new Date()) {
      throw new Error("This invite code has expired");
    }

    // Check if there are uses remaining
    if (invite.uses_remaining !== null && invite.uses_remaining <= 0) {
      throw new Error("This invite code has reached its usage limit");
    }

    // Check if user is already a member of this household
    const { data: existingMembership } = await supabase
      .from("member_households")
      .select("id")
      .eq("household_id", invite.household_id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingMembership) {
      throw new Error("You are already a member of this household");
    }

    // Get the household name
    const { data: household, error: householdError } = await supabase
      .from("households")
      .select("name")
      .eq("id", invite.household_id)
      .single();

    if (householdError) {
      throw new Error("Could not find the household");
    }

    // Add the user as a member
    const { error: memberError } = await supabase
      .from("member_households")
      .insert({
        user_id: userId,
        household_id: invite.household_id,
        role: "member",
      });

    if (memberError) {
      console.error("Error joining household:", memberError);
      throw new Error(`Failed to join household: ${memberError.message}`);
    }

    // Decrement the uses_remaining if it's not null
    if (invite.uses_remaining !== null) {
      await supabase
        .from("household_invites")
        .update({ uses_remaining: invite.uses_remaining - 1 })
        .eq("code", inviteCode);
    }

    return { 
      householdId: invite.household_id, 
      householdName: household.name 
    };
  },

  async getHouseholdMembers(householdId: string) {
    if (!householdId) {
      throw new Error("Household ID is required");
    }

    const { data, error } = await supabase
      .from('member_households')
      .select(`
        id,
        user_id,
        household_id,
        role,
        created_at,
        updated_at,
        profile:profiles (
          first_name,
          last_name,
          phone,
          avatar_url,
          status
        )
      `)
      .eq('household_id', householdId)
      .order('created_at');

    if (error) {
      console.error("Error fetching household members:", error);
      throw new Error(`Failed to fetch household members: ${error.message}`);
    }

    return data;
  },

  async getCurrentUserHousehold() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('member_households')
      .select(`
        household_id,
        household:households (
          id,
          name,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user household:", error);
      throw new Error(`Failed to fetch user household: ${error.message}`);
    }

    return data?.household || null;
  }
};
