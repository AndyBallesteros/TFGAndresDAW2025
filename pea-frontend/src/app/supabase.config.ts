import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environments'; 

let supabase: SupabaseClient;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
      {
        auth:{
          persistSession: false,
        }
      }
    );
  }
  return supabase;
}