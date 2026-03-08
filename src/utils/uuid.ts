import { v4 } from 'uuid';

/**
 * Generate a unique identifier (UUID v4).
 * Thin wrapper for consistent ID generation across the app.
 */
export function generateId(): string {
  return v4();
}
