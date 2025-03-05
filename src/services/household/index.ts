
import { createHousehold } from './create-household';
import { joinHousehold } from './join-household';
import { getHouseholdMembers, getCurrentUserHousehold } from './get-household';
import { leaveHousehold, deleteHousehold } from './delete-household';
import type { 
  CreateHouseholdParams, 
  HouseholdCreationResult, 
  JoinHouseholdParams, 
  HouseholdMember,
  HouseholdData
} from './types';

export const householdService = {
  createHousehold,
  joinHousehold,
  getHouseholdMembers,
  getCurrentUserHousehold,
  leaveHousehold,
  deleteHousehold
};

export type {
  CreateHouseholdParams,
  HouseholdCreationResult,
  JoinHouseholdParams,
  HouseholdMember,
  HouseholdData
};
