
import { supabase } from "@/integrations/supabase/client";
import { HouseholdMember, HouseholdData } from "./types";

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  if (!householdId) {
    throw new Error("Household ID is required");
  }

  console.log("Fetching household members for:", householdId);

  const { data, error } = await supabase
    .from('member_households')
    .select(`
      id,
      user_id,
      household_id,
      role,
      created_at,
      updated_at,
      profiles:user_id (
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
      profile: member.profiles ? {
        first_name: member.profiles.first_name,
        last_name: member.profiles.last_name,
        phone: member.profiles.phone,
        avatar_url: member.profiles.avatar_url,
        status: member.profiles.status
      } : undefined
    } as HouseholdMember;
  });

  console.log("Retrieved household members:", members.length);
  return members;
}

export async function getCurrentUserHousehold(): Promise<HouseholdData | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  console.log("Checking for current user's household");

  // Check if user has a household
  const { data, error: householdError } = await supabase
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

  if (!data || !data.household) {
    console.log("No household found for current user");
    return null;
  }

  // Safely convert to HouseholdData
  const household = data.household as any;
  if (household && typeof household === 'object' && 'id' in household) {
    const result = {
      id: household.id,
      name: household.name,
      created_at: household.created_at
    };
    console.log("Found user household:", result.name);
    return result;
  }

  return null;
}

export async function checkUserHasHousehold(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("No authenticated user found");
    return false;
  }

  console.log("Checking if user has a household");

  const { count, error } = await supabase
    .from('member_households')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) {
    console.error("Error checking household status:", error);
    return false;
  }

  const hasHousehold = count !== null && count > 0;
  console.log("User has household:", hasHousehold);
  return hasHousehold;
}
