
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

  console.log("Creating household:", name, "for user:", userId);

  try {
    // First create the household
    const { data: household, error: householdError } = await supabase
      .from("households")
      .insert({
        name: name.trim(),
        created_by: userId,
        theme,
      })
      .select("id")
      .single();

    if (householdError) {
      console.error("Household creation error:", householdError);
      throw new Error(`Failed to create household: ${householdError.message}`);
    }

    const householdId = household.id;
    console.log("Household created with ID:", householdId);
    
    // Add the user as an admin member with created_by field
    const { error: memberError } = await supabase
      .from("member_households")
      .insert({
        user_id: userId,
        household_id: householdId,
        role: "admin",
        created_by: userId, // Add this field to satisfy RLS policy
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

    console.log("User added as admin to household");

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

    console.log("Invite code created:", generatedInviteCode);
    return { householdId, inviteCode: generatedInviteCode };
  } catch (error: any) {
    console.error("Household creation process failed:", error);
    throw error;
  }
}
