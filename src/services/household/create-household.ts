
import { supabase } from "@/integrations/supabase/client";
import { generateInviteCode } from "@/utils/household";
import { CreateHouseholdParams, HouseholdCreationResult } from "./types";

export async function createHousehold({ 
  name, 
  theme = "default", 
  userId 
}: CreateHouseholdParams): Promise<HouseholdCreationResult> {
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
}
