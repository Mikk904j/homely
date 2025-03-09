
import { supabase } from "@/integrations/supabase/client";
import { JoinHouseholdParams, JoinHouseholdResult } from "./types";

export async function joinHousehold({ 
  inviteCode, 
  userId 
}: JoinHouseholdParams): Promise<JoinHouseholdResult> {
  if (!inviteCode.trim()) {
    throw new Error("Invite code is required");
  }

  if (!userId) {
    throw new Error("User ID is required to join a household");
  }

  // First, find the invite code
  const { data: invite, error: inviteError } = await supabase
    .from("household_invites")
    .select("id, household_id, expires_at, uses_remaining")
    .eq("code", inviteCode.trim())
    .maybeSingle();

  if (inviteError) {
    console.error("Error finding invite:", inviteError);
    throw new Error(`Failed to validate invite code: ${inviteError.message}`);
  }

  if (!invite) {
    throw new Error("Invalid invite code. Please check the code and try again.");
  }

  // Check if the invite is expired
  if (new Date(invite.expires_at) < new Date()) {
    throw new Error("This invite code has expired.");
  }

  // Check if the invite has uses remaining
  if (invite.uses_remaining !== null && invite.uses_remaining <= 0) {
    throw new Error("This invite code has reached its maximum usage limit.");
  }

  // Fetch the household name
  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("name")
    .eq("id", invite.household_id)
    .single();

  if (householdError) {
    console.error("Error fetching household:", householdError);
    throw new Error(`Failed to get household details: ${householdError.message}`);
  }

  // Check if the user is already a member of this household
  const { data: existingMember, error: memberCheckError } = await supabase
    .from("member_households")
    .select("id")
    .match({ user_id: userId, household_id: invite.household_id })
    .maybeSingle();

  if (memberCheckError) {
    console.error("Error checking existing membership:", memberCheckError);
    throw new Error(`Failed to check existing membership: ${memberCheckError.message}`);
  }

  if (existingMember) {
    throw new Error("You are already a member of this household.");
  }

  // Add the user as a member with created_by field
  const { error: joinError } = await supabase
    .from("member_households")
    .insert({
      user_id: userId,
      household_id: invite.household_id,
      role: "member",
      created_by: userId // Include created_by field
    });

  if (joinError) {
    console.error("Error joining household:", joinError);
    throw new Error(`Failed to join household: ${joinError.message}`);
  }

  // Decrement the uses_remaining count if needed
  if (invite.uses_remaining !== null) {
    await supabase
      .from("household_invites")
      .update({ uses_remaining: invite.uses_remaining - 1 })
      .eq("id", invite.id);
  }

  return { 
    householdId: invite.household_id,
    householdName: household.name
  };
}
