import { randomBytes } from 'crypto';

/**
 * Generate a CSRF token for authentication flows
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Validate CSRF token from state parameter
 */
export function validateCSRFToken(token: string | null, storedToken: string | null): boolean {
  if (!token || !storedToken) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  if (token.length !== storedToken.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ storedToken.charCodeAt(i);
  }
  
  return result === 0;
}