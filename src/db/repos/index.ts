/**
 * Repository layer index.
 * Re-exports all DAO modules for convenient imports.
 *
 * Usage: import { habitRepo, userRepo } from '@/db/repos';
 */
export { userRepo } from './userRepo';
export { habitRepo } from './habitRepo';
export { xpRepo } from './xpRepo';
export { questRepo } from './questRepo';
export { settingsRepo } from './settingsRepo';
export { completionRepo } from './completionRepo';
export { streakRepo } from './streakRepo';
