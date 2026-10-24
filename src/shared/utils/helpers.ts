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

/**
 * Get styling classes for a society badge
 * @param society - Society code ('CS', 'RAS', 'PES', 'EMBS')
 * @param isDark - Whether dark mode is active
 * @returns Tailwind CSS classes
 */
export const getSocietyBadgeStyle = (
  society?: string | null,
  isDark?: boolean
): string => {
  switch (society) {
    case 'MAIN':
      return isDark
        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        : 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CS':
      return isDark
        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
        : 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'RAS':
      return isDark
        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
        : 'bg-rose-50 text-rose-700 border-rose-200';
    case 'PES':
      return isDark
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'EMBS':
      return isDark
        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        : 'bg-purple-50 text-purple-700 border-purple-200';
    default:
      return isDark
        ? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
        : 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export {
  uuidToShortId,
  shortIdToUuid,
  getVacancyShareUrl,
} from './shortId';
