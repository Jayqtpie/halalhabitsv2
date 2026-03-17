/**
 * Supabase client singleton for HalalHabits.
 *
 * Order matters: polyfills must load before supabase-js.
 * localStorage polyfill uses expo-sqlite under the hood for
 * session persistence (no AsyncStorage dependency).
 *
 * detectSessionInUrl: false — required for React Native (no URL scheme parsing)
 */
import 'expo-sqlite/localStorage/install';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
