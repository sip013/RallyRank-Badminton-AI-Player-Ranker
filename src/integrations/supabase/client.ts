import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;

// Prefer the new publishable key; fall back to legacy anon only during migration.
const SUPABASE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy .env.example to .env and paste values from Supabase → Settings → API Keys.'
  );
}

if (
  !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  console.warn(
    'RallyRank: using legacy VITE_SUPABASE_ANON_KEY. Switch to VITE_SUPABASE_PUBLISHABLE_KEY (sb_publishable_...) before anon keys are removed.'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);
