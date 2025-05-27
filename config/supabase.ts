import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxmwxbazfukpunmgdscu.supabase.co';
const supabaseAnonKey = '9a5455e05ea0e7aef8a47446de9daf39c493feed5454e263a0210fb6bb8e1147';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto refresh
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
}); 