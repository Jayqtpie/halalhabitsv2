import { randomUUID } from 'expo-crypto';

/**
 * Generate a unique identifier (UUID v4).
 * Thin wrapper for consistent ID generation across the app.
 */
export function generateId(): string {
  return randomUUID();
}
