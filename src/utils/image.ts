/**
 * Decodes and formats a raw base64 image string into a valid Data URL scheme
 * that can be directly rendered inside an HTML <img> tag.
 *
 * Automatically detects MIME types from base64 magic bytes:
 * - PNG ("iVBORw0KGgo...") -> image/png
 * - JPEG ("/9j/...") -> image/jpeg
 * - GIF ("R0lGOD...") -> image/gif
 * - WEBP ("UklGR...") -> image/webp
 *
 * If the string is already formatted as "data:image/...", it is returned as-is.
 * Returns null if the value is invalid, empty, or false.
 */
export function formatBase64Image(base64?: string | boolean | null): string | null {
  if (!base64 || typeof base64 !== 'string') return null;
  const trimmed = base64.trim();
  if (!trimmed || trimmed === 'false' || trimmed === 'null') return null;

  // If already prefixed with a data URI scheme
  if (trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // Detect mime type by signature header in base64 string
  let mime = 'image/png';
  if (trimmed.startsWith('/9j/')) {
    mime = 'image/jpeg';
  } else if (trimmed.startsWith('R0lGOD')) {
    mime = 'image/gif';
  } else if (trimmed.startsWith('UklGR')) {
    mime = 'image/webp';
  }

  return `data:${mime};base64,${trimmed}`;
}
