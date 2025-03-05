
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

export interface HouseholdMember {
  id: string;
  user_id: string;
  household_id: string;
  role: string;
  created_at: string;
  updated_at: string;
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
}
