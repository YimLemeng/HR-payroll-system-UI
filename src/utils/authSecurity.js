/**
 * Frontend Authentication & Security Utilities
 * HR & Payroll Management System
 */

/**
 * Safely parses and decodes a JWT token without requiring external libraries.
 * Handles standard Base64URL encoding according to RFC 7519.
 *
 * @param {string} token
 * @returns {object|null} Decoded payload or null if invalid
 */
export const parseJwt = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse JWT token safely:', err);
    return null;
  }
};

/**
 * Validates token structure and checks if token is expired.
 * Includes a configurable grace buffer (default 10s) to prevent race conditions.
 *
 * @param {string} token
 * @param {number} bufferSeconds
 * @returns {boolean}
 */
export const isTokenValid = (token, bufferSeconds = 10) => {
  const decoded = parseJwt(token);
  if (!decoded || typeof decoded.exp !== 'number') return false;

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return decoded.exp - bufferSeconds > nowInSeconds;
};

/**
 * Returns remaining lifetime in milliseconds for a valid token.
 * Returns 0 if expired or invalid.
 *
 * @param {string} token
 * @returns {number} Remaining time in ms
 */
export const getTokenRemainingTime = (token) => {
  const decoded = parseJwt(token);
  if (!decoded || typeof decoded.exp !== 'number') return 0;

  const expiryMs = decoded.exp * 1000;
  const remaining = expiryMs - Date.now();
  return remaining > 0 ? remaining : 0;
};
