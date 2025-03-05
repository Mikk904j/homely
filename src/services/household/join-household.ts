
import { supabase } from "@/integrations/supabase/client";
import { JoinHouseholdParams } from "./types";

export async function joinHousehold({ 
  inviteCode, 
  userId 
}: JoinHouseholdParams): Promise<{ householdId: string; householdName: string }> {
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
}
