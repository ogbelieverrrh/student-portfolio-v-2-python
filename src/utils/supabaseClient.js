import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export const getSupabaseClient = (url, key) => {
  if (!supabaseInstance && url && key) {
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
};

export const resetSupabaseClient = () => {
  supabaseInstance = null;
};
