import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxmwxbazfukpunmgdscu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bXd4YmF6ZnVrcHVubWdkc2N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMjc5NzQsImV4cCI6MjA2MzkwMzk3NH0.77997c5087a808174dace9811752e5ce';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto refresh
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
}); 