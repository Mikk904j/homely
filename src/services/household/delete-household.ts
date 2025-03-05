
import { supabase } from "@/integrations/supabase/client";

export async function leaveHousehold(userId: string, householdId: string): Promise<void> {
  if (!userId || !householdId) {
    throw new Error("User ID and Household ID are required");
  }

  // Check if user is the last admin
  const { data: members, error: membersError } = await supabase
    .from('member_households')
    .select('id, role')
    .eq('household_id', householdId);

  if (membersError) {
    throw new Error(`Failed to check household members: ${membersError.message}`);
  }

  const admins = members.filter(member => member.role === 'admin');
  
  // Get the current user's membership
  const { data: userMembership, error: userMembershipError } = await supabase
    .from('member_households')
    .select('id, role')
    .eq('household_id', householdId)
    .eq('user_id', userId)
    .single();

  if (userMembershipError) {
    throw new Error(`Failed to check user membership: ${userMembershipError.message}`);
  }

  // If user is the only admin, they can't leave unless they're the only member
  if (userMembership.role === 'admin' && admins.length === 1 && members.length > 1) {
    throw new Error("As the only admin, you must promote another member to admin before leaving.");
  }

  // Delete the membership
  const { error: deleteError } = await supabase
    .from('member_households')
    .delete()
    .eq('user_id', userId)
    .eq('household_id', householdId);

  if (deleteError) {
    throw new Error(`Failed to leave household: ${deleteError.message}`);
  }

  // If user was the last member, delete the household
  if (members.length === 1) {
    await supabase
      .from('households')
      .delete()
      .eq('id', householdId);
  }
}

export async function deleteHousehold(userId: string, householdId: string): Promise<void> {
  if (!userId || !householdId) {
    throw new Error("User ID and Household ID are required");
  }

  // Check if user is an admin
  const { data: membership, error: membershipError } = await supabase
    .from('member_households')
    .select('role')
    .eq('household_id', householdId)
    .eq('user_id', userId)
    .single();

  if (membershipError || !membership) {
    throw new Error("You are not a member of this household");
  }

  if (membership.role !== 'admin') {
    throw new Error("Only household administrators can delete a household");
  }

  // Delete the household (cascade will handle related records)
  const { error: deleteError } = await supabase
    .from('households')
    .delete()
    .eq('id', householdId);

  if (deleteError) {
    throw new Error(`Failed to delete household: ${deleteError.message}`);
  }
}
