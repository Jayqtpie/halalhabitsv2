/**
 * Database client initialization.
 *
 * Uses expo-sqlite (modern API, NOT legacy) with WAL mode enabled
 * and Drizzle ORM for typed queries.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/sqlite/
 * @see https://orm.drizzle.team/docs/connect-expo-sqlite
 */
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('halalhabits.db');
expoDb.execSync("PRAGMA journal_mode = 'wal'");

export const db = drizzle(expoDb, { schema });

/**
 * Get the Drizzle database instance.
 * Used by repository modules for typed queries.
 */
export function getDb() {
  return db;
}
