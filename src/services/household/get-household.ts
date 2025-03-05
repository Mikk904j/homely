
import { supabase } from "@/integrations/supabase/client";
import { HouseholdMember } from "./types";

export async function getHouseholdMembers(householdId: string) {
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

  return data as HouseholdMember[];
}

export async function getCurrentUserHousehold() {
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
