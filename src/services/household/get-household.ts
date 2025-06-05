
import { supabase } from "@/integrations/supabase/client";
import { HouseholdData, HouseholdMember } from "./types";

/**
 * Get all members of a household with their profile information
 */
export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  try {
    // First get all members
    const { data: memberData, error: memberError } = await supabase
      .from('member_households')
      .select('id, user_id, household_id, role, created_at, updated_at')
      .eq('household_id', householdId);

    if (memberError) {
      console.error("Error fetching household members:", memberError);
      throw new Error(`Failed to fetch household members: ${memberError.message}`);
    }

    if (!memberData || memberData.length === 0) {
      return [];
    }

    // Then fetch profile information for each member
    const members: HouseholdMember[] = [];

    for (const member of memberData) {
      // Only proceed if we have a user ID
      if (member.user_id) {
        // Try to get profile information
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, avatar_url, status')
          .eq('id', member.user_id)
          .maybeSingle();

        if (profileError) {
          console.warn(`Could not fetch profile for user ${member.user_id}:`, profileError);
        }

        if (!profileData) {
          // No profile found, just add the member without profile data
          members.push({
            id: member.id,
            user_id: member.user_id,
            household_id: member.household_id,
            role: member.role,
            created_at: member.created_at,
            updated_at: member.updated_at
          });
        } else if (profileData) {
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
        } else {
          // Profile doesn't exist, add member without profile
          members.push({
            id: member.id,
            user_id: member.user_id,
            household_id: member.household_id,
            role: member.role,
            created_at: member.created_at,
            updated_at: member.updated_at
          });
        }
      } else {
        // Skip members without user_id
        console.warn("Found member without user_id:", member);
      }
    }

    return members;
  } catch (error: any) {
    console.error("Error in getHouseholdMembers:", error);
    throw error;
  }
}

/**
 * Get the current user's household information
 */
export async function getCurrentUserHousehold(): Promise<HouseholdData | null> {
  try {
    // First get the user's membership
    const { data: memberData, error: memberError } = await supabase
      .from('member_households')
      .select('household_id, role')
      .maybeSingle();

    if (memberError) {
      console.error("Error fetching user's household membership:", memberError);
      throw new Error(`Failed to fetch your household membership: ${memberError.message}`);
    }

    if (!memberData) {
      return null; // User doesn't belong to any household
    }

    // Then get the household details
    const { data: householdData, error: householdError } = await supabase
      .from('households')
      .select('id, name, created_at')
      .eq('id', memberData.household_id)
      .maybeSingle();

    if (householdError) {
      console.error("Error fetching household details:", householdError);
      throw new Error(`Failed to fetch household details: ${householdError.message}`);
    }

    if (!householdData) {
      console.log("Household not found");
      return null; 
    }

    const result: HouseholdData = {
      id: householdData.id,
      name: householdData.name,
      created_at: householdData.created_at,
      userRole: memberData.role,
    };

    return result;
  } catch (error: any) {
    console.error("Error in getCurrentUserHousehold:", error);
    throw error;
  }
}

/**
 * Check if the current user belongs to any household
 * Returns true if they do, false otherwise
 * Uses the new simplified security definer function
 */
export async function checkUserHasHousehold(): Promise<boolean> {
  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log("No authenticated user found");
      return false;
    }

    // Use the new security definer function to check membership
    const { data, error } = await supabase
      .rpc('check_user_household_membership', { user_uuid: user.id });

    if (error) {
      console.error("Error checking household membership:", error);
      // On error, fallback to direct query
      const { count, error: fallbackError } = await supabase
        .from('member_households')
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (fallbackError) {
        console.error("Fallback query also failed:", fallbackError);
        return false;
      }

      return count ? count > 0 : false;
    }

    return Boolean(data);
  } catch (error: any) {
    console.error("Error in checkUserHasHousehold:", error);
    return false;
  }
}
