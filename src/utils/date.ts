/**
 * Returns the current date/time as an ISO 8601 string.
 * Use this everywhere instead of raw Date calls for consistency.
 */
export function toISOString(): string {
  return new Date().toISOString();
}

/**
 * Converts a Date object to an ISO 8601 string.
 */
export function dateToISO(date: Date): string {
  return date.toISOString();
}
