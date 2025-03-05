
import { supabase } from "@/integrations/supabase/client";
import { HouseholdMember, HouseholdData } from "./types";

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
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
      profiles:profiles (
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

  // Transform the raw data to match our expected types
  const members = data.map(member => {
    return {
      ...member,
      profile: member.profiles || null
    } as HouseholdMember;
  });

  return members;
}

export async function getCurrentUserHousehold(): Promise<HouseholdData | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Check if user has a household
  const { data: households, error: householdError } = await supabase
    .from('member_households')
    .select(`
      household:households (
        id,
        name,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .maybeSingle();

  if (householdError) {
    console.error("Error fetching user household:", householdError);
    throw new Error(`Failed to fetch user household: ${householdError.message}`);
  }

  return households?.household as HouseholdData || null;
}

export async function checkUserHasHousehold(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }

  const { count, error } = await supabase
    .from('member_households')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) {
    console.error("Error checking household status:", error);
    return false;
  }

  return count !== null && count > 0;
}
