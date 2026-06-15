/* ============================================================
   Supabase project config
   Get these from: Supabase Studio -> Project Settings -> API
   - Project URL  -> SB_URL
   - anon public  -> SB_ANON_KEY   (safe to expose; RLS protects data)
   ============================================================ */
const SB_URL      = "https://ncgfahyqnwawdjcyhrfd.supabase.co";
const SB_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZ2ZhaHlxbndhd2RqY3locmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDMwOTEsImV4cCI6MjA5NzA3OTA5MX0.KlLksYTwkH_ZKJXOpaRPRAxmzuZmZcFwMf4BahZ8lGk";

const sb = window.supabase.createClient(SB_URL, SB_ANON_KEY);
