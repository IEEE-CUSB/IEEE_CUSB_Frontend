/**
 * Format a date to a readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Truncate a string to a specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string with ellipsis if needed
 */
export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

/**
 * Capitalize the first letter of a string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Generate a random ID
 * @returns Random string ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
/**
 * Helper to decode JWT token
 */
export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    return JSON.parse(atob(base64Url));
  } catch (e) {
    return null;
  }
};

/**
 * Extract error message from any error object
 * @param error - Error object or string
 * @returns Error message string
 */
export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Unknown error occurred';
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
   
  if ((error as any).message) return (error as any).message;
  return 'Unknown error occurred';
};

/**
 * Strip HTML tags and decode HTML entities to plain text
 * @param html - HTML string to convert
 * @returns Clean plain text string
 */
export const stripHtmlToText = (html: string): string => {
  if (!html) return '';

  // Replace block elements and line breaks with spaces so words don't merge together
  const spacedHtml = html
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ');

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(spacedHtml, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }

  // Fallback for non-browser environments
  return spacedHtml
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
};
