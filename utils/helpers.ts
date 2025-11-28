/**
 * Generates a snake_case ID from a given name.
 * Replaces non-alphanumeric characters with underscores,
 * collapses multiple underscores, and trims leading/trailing underscores.
 */
export const generateIdFromName = (name: string, suffix: string = ''): string => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  return (base || 'entity') + (suffix ? `_${suffix}` : '');
};

/**
 * Sanitizes an input string to be a valid ID (snake_case-ish).
 * Allows only lowercase letters, numbers, and underscores.
 */
export const sanitizeId = (input: string): string => {
  return input.toLowerCase().replace(/[^a-z0-9_]/g, '_');
};

/**
 * Generates a temporary ID for new items.
 */
export const generateTempId = (prefix: string = 'new_item'): string => {
  return `${prefix}_${Date.now()}`;
};

/**
 * Checks if an ID is a temporary one.
 */
export const isTempId = (id: string, prefix: string = 'new_item'): boolean => {
  return id.startsWith(`${prefix}_`);
};

/**
 * Escapes special characters in a string for safe YAML/code display.
 * Prevents XSS attacks when rendering user input in code blocks.
 */
export const escapeYaml = (input: string | undefined | null): string => {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n');
};

/**
 * Escapes a string for safe HTML display (XSS prevention).
 */
export const escapeHtml = (input: string | undefined | null): string => {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};
