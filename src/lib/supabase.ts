/**
 * Supabase client singleton for HalalHabits.
 *
 * Order matters: polyfills must load before supabase-js.
 * localStorage polyfill uses expo-sqlite under the hood for
 * session persistence (no AsyncStorage dependency).
 *
 * detectSessionInUrl: false — required for React Native (no URL scheme parsing)
 */
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Guard: allow app to run without Supabase credentials (offline-only mode)
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let _supabase: ReturnType<typeof createClient> | null = null;

if (supabaseConfigured) {
  // localStorage polyfill must load before createClient — uses expo-sqlite under the hood
  require('expo-sqlite/localStorage/install');

  _supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = _supabase as ReturnType<typeof createClient>;
