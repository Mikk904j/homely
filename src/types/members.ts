
export type MemberRole = 'admin' | 'member';

export interface Household {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

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
    status: string;
  };
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  phone: string;
  role: MemberRole;
}
