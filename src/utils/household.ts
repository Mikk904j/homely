
/**
 * Generates a random alphanumeric invite code
 * @returns A random 8-character alphanumeric code
 */
export const generateInviteCode = (): string => {
  // Generate a random 8-character alphanumeric code
  // Excludes confusing characters like 0, O, 1, I
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  
  // Use crypto API if available for better randomness
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint8Array(8);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(values[i] % chars.length);
    }
  } else {
    // Fallback to Math.random
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  
  return result;
};

/**
 * Validates a household invite code format
 * @param code The invite code to validate
 * @returns True if the code matches the expected format
 */
export const validateInviteCode = (code: string): boolean => {
  if (!code) return false;
  
  // Code should be 8 characters and only contain A-Z and 2-9
  // Excludes 0, 1, O, I to avoid confusion
  const pattern = /^[A-HJ-NP-Z2-9]{8}$/;
  return pattern.test(code.toUpperCase());
};

/**
 * Formats an invite code for display by adding a hyphen in the middle
 * @param code The invite code to format
 * @returns Formatted invite code (e.g., "ABCD-EFGH")
 */
export const formatInviteCode = (code: string): string => {
  if (!code) return '';
  
  const cleanCode = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleanCode.length !== 8) return cleanCode;
  return `${cleanCode.slice(0, 4)}-${cleanCode.slice(4)}`;
};

/**
 * Normalizes an invite code by removing formatting
 * @param code The invite code to normalize
 * @returns Normalized invite code with no hyphens or spaces
 */
export const normalizeInviteCode = (code: string): string => {
  if (!code) return '';
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

/**
 * Checks if a string is a valid household name
 * @param name The household name to validate
 * @returns True if valid, false otherwise
 */
export const isValidHouseholdName = (name: string): boolean => {
  if (!name) return false;
  
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 50;
};
