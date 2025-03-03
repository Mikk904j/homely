
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for Household-related database operations
 */
export class HouseholdService {
  /**
   * Creates a new household
   * @param name The household name
   * @param createdBy The user ID of the creator
   * @param theme The household theme
   * @returns The created household ID and name
   */
  static async createHousehold(name: string, createdBy: string, theme: string) {
    const { data, error } = await supabase
      .from("households")
      .insert({
        name: name.trim(),
        created_by: createdBy,
        theme: theme,
      })
      .select("id, name")
      .single();

    if (error) {
      console.error("Error creating household:", error);
      throw new Error(`Failed to create household: ${error.message}`);
    }

    return data;
  }

  /**
   * Adds a user as a member of a household
   * @param userId The user ID
   * @param householdId The household ID
   * @param role The role of the user (admin or member)
   */
  static async addHouseholdMember(userId: string, householdId: string, role: "admin" | "member") {
    const { error } = await supabase
      .from("member_households")
      .insert({
        user_id: userId,
        household_id: householdId,
        role: role,
      });

    if (error) {
      console.error("Error adding household member:", error);
      throw new Error(`Failed to add member to household: ${error.message}`);
    }
  }

  /**
   * Creates a household invite
   * @param householdId The household ID
   * @param code The invite code
   * @param createdBy The user ID of the creator
   * @param expiresIn The expiration time in milliseconds (default: 7 days)
   * @param usesRemaining The number of uses allowed (default: 10)
   */
  static async createInvite(
    householdId: string, 
    code: string, 
    createdBy: string, 
    expiresIn: number = 7 * 24 * 60 * 60 * 1000, 
    usesRemaining: number = 10
  ) {
    const expiryDate = new Date(Date.now() + expiresIn).toISOString();
    
    const { error } = await supabase
      .from("household_invites")
      .insert({
        household_id: householdId,
        code: code,
        created_by: createdBy,
        expires_at: expiryDate,
        uses_remaining: usesRemaining
      });

    if (error) {
      console.error("Error creating invite:", error);
      throw new Error(`Failed to create invite: ${error.message}`);
    }
  }

  /**
   * Fetches invite details by code
   * @param code The invite code
   * @returns The invite details or null if not found
   */
  static async getInviteByCode(code: string) {
    const { data, error } = await supabase
      .from("household_invites")
      .select("*, households(name)")
      .eq("code", code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned error - invite not found
        return null;
      }
      
      console.error("Error fetching invite:", error);
      throw new Error(`Failed to fetch invite: ${error.message}`);
    }

    return data;
  }

  /**
   * Decrements the remaining uses for an invite
   * @param code The invite code
   */
  static async decrementInviteUses(code: string) {
    const { data: invite, error: fetchError } = await supabase
      .from("household_invites")
      .select("uses_remaining")
      .eq("code", code)
      .single();

    if (fetchError) {
      console.error("Error fetching invite for decrement:", fetchError);
      throw new Error(`Failed to update invite usage: ${fetchError.message}`);
    }

    if (invite.uses_remaining === null) {
      return; // Unlimited uses, no need to decrement
    }

    if (invite.uses_remaining <= 0) {
      throw new Error("This invite has no uses remaining");
    }

    const { error: updateError } = await supabase
      .from("household_invites")
      .update({ uses_remaining: invite.uses_remaining - 1 })
      .eq("code", code);

    if (updateError) {
      console.error("Error updating invite uses:", updateError);
      throw new Error(`Failed to update invite usage: ${updateError.message}`);
    }
  }

  /**
   * Checks if a user is already a member of a household
   * @param userId The user ID
   * @param householdId The household ID
   * @returns True if the user is a member
   */
  static async isUserMemberOfHousehold(userId: string, householdId: string) {
    const { data, error } = await supabase
      .from("member_households")
      .select("id")
      .eq("household_id", householdId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error checking household membership:", error);
      throw new Error(`Failed to check membership: ${error.message}`);
    }

    return !!data;
  }

  /**
   * Gets household details
   * @param householdId The household ID
   * @returns The household details
   */
  static async getHouseholdDetails(householdId: string) {
    const { data, error } = await supabase
      .from("households")
      .select("*")
      .eq("id", householdId)
      .single();

    if (error) {
      console.error("Error fetching household details:", error);
      throw new Error(`Failed to fetch household: ${error.message}`);
    }

    return data;
  }

  /**
   * Gets all households a user is a member of
   * @param userId The user ID
   * @returns Array of households with membership details
   */
  static async getUserHouseholds(userId: string) {
    const { data, error } = await supabase
      .from("member_households")
      .select(`
        id, 
        role,
        household_id,
        households (
          id, 
          name, 
          created_at, 
          created_by,
          theme
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user households:", error);
      throw new Error(`Failed to fetch households: ${error.message}`);
    }

    return data;
  }
}
