
import { supabase } from "@/integrations/supabase/client";
import { HouseholdMember, HouseholdData } from "./types";

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  if (!householdId) {
    throw new Error("Household ID is required");
  }

  console.log("Fetching household members for:", householdId);

  try {
    // First fetch the member_households records
    const { data: memberData, error: memberError } = await supabase
      .from('member_households')
      .select('id, user_id, household_id, role, created_at, updated_at')
      .eq('household_id', householdId)
      .order('created_at');

    if (memberError) {
      console.error("Error fetching household members:", memberError);
      throw new Error(`Failed to fetch household members: ${memberError.message}`);
    }

    if (!memberData || memberData.length === 0) {
      console.log("No household members found");
      return [];
    }

    // Now get the profile information for each member
    const members: HouseholdMember[] = [];
    
    // Process each member one by one to avoid complex joins
    for (const member of memberData) {
      if (member.user_id) {
        // Get profile for this member
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, avatar_url, status')
          .eq('id', member.user_id)
          .single();

        if (profileError) {
          console.warn(`Could not fetch profile for user ${member.user_id}:`, profileError);
          // Still add the member, but without profile data
          members.push({
            id: member.id,
            user_id: member.user_id,
            household_id: member.household_id,
            role: member.role,
            created_at: member.created_at,
            updated_at: member.updated_at
          });
        } else {
          // Add member with profile data
          members.push({
            id: member.id,
            user_id: member.user_id,
            household_id: member.household_id,
            role: member.role,
            created_at: member.created_at,
            updated_at: member.updated_at,
            profile: {
              first_name: profileData.first_name,
              last_name: profileData.last_name,
              phone: profileData.phone,
              avatar_url: profileData.avatar_url,
              status: profileData.status
            }
          });
        }
      } else {
        // Member without user_id
        members.push({
          id: member.id,
          user_id: member.user_id || '',
          household_id: member.household_id,
          role: member.role,
          created_at: member.created_at,
          updated_at: member.updated_at
        });
      }
    }

    console.log("Retrieved household members:", members.length);
    return members;
  } catch (err) {
    console.error("Error in getHouseholdMembers:", err);
    throw err;
  }
}

export async function getCurrentUserHousehold(): Promise<HouseholdData | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return null;
    }

    console.log("Checking for current user's household");

    // First get the household_id for this user - use direct query
    const { data: memberData, error: memberError } = await supabase
      .from('member_households')
      .select('household_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberError) {
      console.error("Error fetching user household:", memberError);
      throw new Error(`Failed to fetch user household: ${memberError.message}`);
    }

    if (!memberData || !memberData.household_id) {
      console.log("No household found for current user");
      return null;
    }

    // Then get the household details separately
    const { data: householdData, error: householdError } = await supabase
      .from('households')
      .select('id, name, created_at')
      .eq('id', memberData.household_id)
      .single();

    if (householdError) {
      console.error("Error fetching household details:", householdError);
      throw new Error(`Failed to fetch household details: ${householdError.message}`);
    }

    const result: HouseholdData = {
      id: householdData.id,
      name: householdData.name,
      created_at: householdData.created_at
    };
    
    console.log("Found user household:", result.name);
    return result;
  } catch (err) {
    console.error("Error in getCurrentUserHousehold:", err);
    throw err;
  }
}

export async function checkUserHasHousehold(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("No authenticated user found");
      return false;
    }

    console.log("Checking if user has a household");

    // Use a count query to avoid potential infinite recursion
    const { count, error } = await supabase
      .from('member_households')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error("Error checking household status:", error);
      throw error;
    }

    const hasHousehold = count !== null && count > 0;
    console.log("User has household:", hasHousehold);
    return hasHousehold;
  } catch (err) {
    console.error("Error in checkUserHasHousehold:", err);
    return false; // Return false on error to avoid breaking the application
  }
}
