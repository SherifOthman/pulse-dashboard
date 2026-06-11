/**
 * Returns the server origin (scheme + host + port) derived from VITE_API_URL.
 * Used to resolve relative upload paths like `/uploads/foo.jpg` to absolute URLs.
 */
export const API_ORIGIN = (
  import.meta.env.VITE_API_URL || 'http://localhost:5170/dashboard'
).replace('/dashboard', '')

export function toAbsoluteUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_ORIGIN}${path}`
}
