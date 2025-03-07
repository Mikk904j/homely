
import { MemberRole } from "@/services/household/types";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  email?: string | null;
}

export interface Household {
  id: string;
  name: string;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  theme?: string | null;
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
    status: string | null;
  };
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  phone: string;
  role: MemberRole;
}

// Fix the re-export using 'export type' to comply with isolatedModules
export type { MemberRole } from "@/services/household/types";
