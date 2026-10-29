/**
 * Utility functions to convert between 36-char standard UUIDs and 22-char Base64URL short IDs.
 *
 * Example:
 * UUID:     111ce19f-f2e0-4820-b966-c2649b62f5a1
 * Short ID: ERzhn_LgSCC5ZsJkm2L1oQ
 */

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX32_REGEX = /^[0-9a-f]{32}$/i;

/**
 * Encodes a 36-character UUID (or 32-char hex string) into a 22-character Base64URL string.
 * If the input is not a valid UUID, returns the original input as-is.
 */
export const uuidToShortId = (uuid: string): string => {
  if (!uuid) return '';
  const clean = uuid.replace(/-/g, '');
  if (clean.length !== 32 || !HEX32_REGEX.test(clean)) {
    return uuid;
  }

  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }

  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Decodes a 22-character Base64URL string back into a canonical 36-character UUID.
 * If the input is already a UUID or cannot be decoded, returns the input as-is.
 */
export const shortIdToUuid = (shortId: string): string => {
  if (!shortId) return '';

  // Already formatted UUID
  if (UUID_REGEX.test(shortId)) {
    return shortId.toLowerCase();
  }

  // 32-char hex without hyphens
  if (HEX32_REGEX.test(shortId)) {
    return [
      shortId.slice(0, 8),
      shortId.slice(8, 12),
      shortId.slice(12, 16),
      shortId.slice(16, 20),
      shortId.slice(20, 32),
    ]
      .join('-')
      .toLowerCase();
  }

  try {
    let base64 = shortId.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    const binary = atob(base64);
    if (binary.length !== 16) {
      return shortId;
    }

    let hex = '';
    for (let i = 0; i < 16; i++) {
      hex += binary.charCodeAt(i).toString(16).padStart(2, '0');
    }

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32),
    ]
      .join('-')
      .toLowerCase();
  } catch {
    return shortId;
  }
};

/**
 * Generates the full shareable URL for a vacancy using the short route and short ID.
 */
export const getVacancyShareUrl = (idOrUuid: string): string => {
  const shortId = uuidToShortId(idOrUuid);
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ieeecusb.org';
  return `${origin}/v/${shortId}`;
};
