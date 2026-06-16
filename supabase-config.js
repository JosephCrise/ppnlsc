/* ============================================================
   Supabase project config
   Get these from: Supabase Studio -> Project Settings -> API
   - Project URL  -> SB_URL
   - anon public  -> SB_ANON_KEY   (safe to expose; RLS protects data)
   ============================================================ */
const SB_URL      = "https://ncgfahyqnwawdjcyhrfd.supabase.co";
const SB_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZ2ZhaHlxbndhd2RqY3locmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MDMwOTEsImV4cCI6MjA5NzA3OTA5MX0.KlLksYTwkH_ZKJXOpaRPRAxmzuZmZcFwMf4BahZ8lGk";

// persistSession + autoRefreshToken => log in ONCE; the session is shared across
// every page/menu and survives reloads, auto-refreshing so it never expires mid-use.
const sb = window.supabase.createClient(SB_URL, SB_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: "ppnlsc-auth" }
});

/* ---- Telegram notification (see TELEGRAM-SETUP.md) ----
   Fill both values to get a Telegram message on every saved permission request.
   Leave the placeholders to disable notifications. */
const TG_BOT_TOKEN = "8679739566:AAGlAmiSXiqLR0LRy3HBgiO1BlQKrihYidQ";   // from @BotFather
const TG_CHAT_ID   = "857114152";              // your (admin) Telegram chat id
// Optional: a channel/group that ALL students join, so everyone is notified too.
// Public channel: use "@channel_username".  Private channel/group: use its "-100..." id.
const TG_CHANNEL_ID = "@ppnlsc_permission";                       // leave "" to notify admin only
