
export interface CreateHouseholdParams {
  name: string;
  theme?: string;
  userId: string;
}

export interface HouseholdCreationResult {
  householdId: string;
  inviteCode: string;
}

export interface JoinHouseholdParams {
  inviteCode: string;
  userId: string;
}

export interface JoinHouseholdResult {
  householdId: string;
  householdName: string;
}

export type MemberRole = 'admin' | 'member';

export interface HouseholdMember {
  id: string;
  user_id: string;
  household_id: string;
  role: MemberRole;
  created_at: string | null;
  updated_at: string | null;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    status: string | null;
  };
}

export interface HouseholdData {
  id: string;
  name: string;
  created_at: string;
  userRole?: MemberRole; // Added the missing userRole property
}
