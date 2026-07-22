import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function querySupabase<T>(table: string, query?: { select?: string; filter?: string }) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const select = query?.select ?? "*";
  const request = supabase.from(table).select(select);

  if (query?.filter) {
    return (await request.eq("id", query.filter)) as { data: T[] | null; error: Error | null };
  }

  return (await request) as { data: T[] | null; error: Error | null };
}
