import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

const env = getPublicEnv();

export const supabaseBrowserClient = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
