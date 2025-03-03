
/**
 * Generates a random alphanumeric invite code
 * @returns A random 8-character alphanumeric code
 */
export const generateInviteCode = (): string => {
  // Generate a random 8-character alphanumeric code
  // Excludes confusing characters like 0, O, 1, I
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
