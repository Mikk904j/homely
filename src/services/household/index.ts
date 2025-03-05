
import { createHousehold } from './create-household';
import { joinHousehold } from './join-household';
import { getHouseholdMembers, getCurrentUserHousehold, checkUserHasHousehold } from './get-household';
import { leaveHousehold, deleteHousehold } from './delete-household';
import type { 
  CreateHouseholdParams, 
  HouseholdCreationResult, 
  JoinHouseholdParams,
  JoinHouseholdResult,
  HouseholdMember,
  HouseholdData,
  MemberRole
} from './types';

export const householdService = {
  createHousehold,
  joinHousehold,
  getHouseholdMembers,
  getCurrentUserHousehold,
  checkUserHasHousehold,
  leaveHousehold,
  deleteHousehold
};

export type {
  CreateHouseholdParams,
  HouseholdCreationResult,
  JoinHouseholdParams,
  JoinHouseholdResult,
  HouseholdMember,
  HouseholdData,
  MemberRole
};
