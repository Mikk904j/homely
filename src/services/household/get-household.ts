
import { supabase } from "@/integrations/supabase/client";
import { HouseholdMember, HouseholdData } from "./types";

export async function getHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  if (!householdId) {
    throw new Error("Household ID is required");
  }

  console.log("Fetching household members for:", householdId);

  try {
    // Use a more straightforward query approach that's type-safe
    const { data, error } = await supabase
      .from('member_households')
      .select(`
        id, 
        user_id, 
        household_id, 
        role, 
        created_at, 
        updated_at,
        profiles:profiles(id, first_name, last_name, phone, avatar_url, status)
      `)
      .eq('household_id', householdId)
      .order('created_at');

    if (error) {
      console.error("Error fetching household members:", error);
      throw new Error(`Failed to fetch household members: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log("No household members found");
      return [];
    }

    // Map the joined data to the HouseholdMember interface, with type safety
    const members: HouseholdMember[] = data.map(item => {
      const profile = item.profiles as any; // Cast to any to resolve typing issues
      
      return {
        id: item.id,
        user_id: item.user_id,
        household_id: item.household_id,
        role: item.role,
        created_at: item.created_at,
        updated_at: item.updated_at,
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

    // Check if user has a household
    const { data, error } = await supabase
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

    if (error) {
      console.error("Error fetching user household:", error);
      throw new Error(`Failed to fetch user household: ${error.message}`);
    }

    if (!data || !data.household) {
      console.log("No household found for current user");
      return null;
    }

    // Safely convert to HouseholdData
    const household = data.household as any;
    if (household && typeof household === 'object' && 'id' in household) {
      const result: HouseholdData = {
        id: household.id,
        name: household.name,
        created_at: household.created_at
      };
      console.log("Found user household:", result.name);
      return result;
    }

    return null;
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
  } catch (err) {
    console.error("Error in checkUserHasHousehold:", err);
    return false;
  }
}
