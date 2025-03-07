
import { supabase } from "@/integrations/supabase/client";
import { HouseholdMember, HouseholdData } from "./types";

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  if (!householdId) {
    throw new Error("Household ID is required");
  }

  console.log("Fetching household members for:", householdId);

  // First get member households
  const { data: membersData, error: membersError } = await supabase
    .from('member_households')
    .select('id, user_id, household_id, role, created_at, updated_at')
    .eq('household_id', householdId)
    .order('created_at');

  if (membersError) {
    console.error("Error fetching household members:", membersError);
    throw new Error(`Failed to fetch household members: ${membersError.message}`);
  }

  // Get all user_ids to fetch profiles
  const userIds = membersData.map(member => member.user_id);
  
  // Fetch profiles separately
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, phone, avatar_url, status')
    .in('id', userIds);

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }

  // Create a map of profiles by user_id for quick lookup
  const profilesMap = new Map();
  profilesData.forEach(profile => {
    profilesMap.set(profile.id, profile);
  });

  // Combine the data
  const members: HouseholdMember[] = membersData.map(member => {
    const profile = profilesMap.get(member.user_id);
    return {
      id: member.id,
      user_id: member.user_id,
      household_id: member.household_id,
      role: member.role,
      created_at: member.created_at,
      updated_at: member.updated_at,
      profile: profile ? {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        status: profile.status
      } : undefined
    };
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
