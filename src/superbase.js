import { createClient } from '@supabase/supabase-js';

// URL fallback por si Vercel no inyecta la variable
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tolqkcsbtnkzudwtdypr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvbHFrY3NidG5renVkd3RkeXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMDYxOTYsImV4cCI6MjEwNDU4MjE5Nn0.BRtB_SnocB5iyPu8PDo20k_g-utbittPdxU3KCsjUcY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);