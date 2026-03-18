/**
 * Push notification Edge Function.
 *
 * Triggered by a Supabase database webhook on push_notifications INSERT.
 * Looks up the user's Expo push token and delivers the notification via
 * the Expo Push API.
 *
 * Environment variables required:
 *   SUPABASE_URL           — auto-injected by Supabase Edge Function runtime
 *   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase Edge Function runtime
 *   EXPO_ACCESS_TOKEN      — set manually in Supabase Dashboard -> Edge Functions -> push -> Secrets
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;

    if (!record?.user_id || !record?.title || !record?.body) {
      return new Response('Missing fields', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: user } = await supabase
      .from('users')
      .select('expo_push_token')
      .eq('id', record.user_id)
      .single();

    if (!user?.expo_push_token) {
      return new Response(JSON.stringify({ message: 'No push token' }), { status: 200 });
    }

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Deno.env.get('EXPO_ACCESS_TOKEN')}`,
      },
      body: JSON.stringify({
        to: user.expo_push_token,
        sound: 'default',
        title: record.title,
        body: record.body,
      }),
    });

    const result = await res.json();
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
