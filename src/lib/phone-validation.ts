// Client-side phone validation utility
// Uses regex-based validation to avoid Node.js module conflicts with Turbopack

/**
 * Validates a phone number using regex (for Zod schemas)
 * This avoids importing react-phone-number-input which causes Node.js module conflicts
 * 
 * Philippine phone number formats:
 * - Mobile: 09XX XXX XXXX (11 digits starting with 09)
 * - Mobile international: +63 9XX XXX XXXX (12 digits total: 63 + 9 more)
 * - Landline: 0X XXX XXXX (10 digits, area codes 02-08)
 * - Landline international: +63 X XXX XXXX (12 digits total: 63 + 9 more)
 */
export function isValidPhoneNumberSync(
  phone: string,
  country?: string
): boolean {
  if (!phone || phone.trim().length === 0) {
    return false;
  }
  
  // Remove all non-digit characters except the leading +
  const cleaned = phone.trim();
  
  // Remove all non-digit characters to get pure digits
  const digits = cleaned.replace(/\D/g, "");
  
  // For Philippines (PH), validate common formats
  if (country === "PH" || !country) {
    // Check international format first (+63...)
    if (cleaned.startsWith("+63") || digits.startsWith("63")) {
      // International format: +63 followed by area code and number (12 digits total)
      if (digits.length === 12) {
        if (digits[2] === "9") {
          // Mobile: +63 9XX XXX XXXX (63 + 9 digits starting with 9)
          return /^639\d{9}$/.test(digits);
        } else {
          // Landline: +63 2-8 XXX XXXX (63 + 9 digits starting with 2-8)
          return /^63[2-8]\d{9}$/.test(digits);
        }
      }
      return false;
    }
    
    // Check local format (starting with 0)
    if (digits.startsWith("0")) {
      if (digits.length === 11 && digits[1] === "9") {
        // Mobile: 09XX XXX XXXX (11 digits)
        // Validate: 09 followed by 9 more digits
        return /^09\d{9}$/.test(digits);
      } else if (digits.length === 10) {
        // Landline: 0X XXX XXXX (10 digits, area codes 02-08)
        // Validate: 0 followed by 2-8, then 8 more digits
        return /^0[2-8]\d{8}$/.test(digits);
      }
      return false;
    }
    
    // If it doesn't start with 0 or 63, it's invalid for PH
    return false;
  }
  
  // For other countries: basic validation - at least 10 digits
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Async version that uses the actual react-phone-number-input library
 * Only use this for final validation on form submit, not in Zod schemas
 * NOTE: This function may fail in some environments due to Node.js module conflicts
 */
export async function isValidPhoneNumber(
  phone: string,
  country?: string
): Promise<boolean> {
  // Always use sync validation to avoid Node.js module issues
  // The async version with react-phone-number-input causes issues with Turbopack
  return isValidPhoneNumberSync(phone, country);
  
  // Commented out to avoid Node.js module conflicts
  // if (typeof window === "undefined") {
  //   return isValidPhoneNumberSync(phone, country);
  // }
  // 
  // try {
  //   const module = await import("react-phone-number-input");
  //   return module.isValidPhoneNumber(phone, country as any);
  // } catch (error) {
  //   console.warn("Phone validation module failed to load, using fallback:", error);
  //   return isValidPhoneNumberSync(phone, country);
  // }
}

