-- ============================================================================
-- Split each current "editor" account into: (1) their existing account,
-- demoted to a normal (view-only) user, and (2) a brand-new dedicated
-- account with admin rights, used only to log into admin.html.
--
-- Run in Supabase SQL Editor. Safe to re-run (idempotent) EXCEPT step 2,
-- which requires the new "<name>-admin@ppnlsc.local" accounts to already
-- exist (created via Dashboard) before it runs — see the instructions below.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1 — demote all 14 current editor accounts to normal users.
-- They keep their existing login; they just lose edit rights on the public
-- site and can no longer get into admin.html.
-- ----------------------------------------------------------------------------
update auth.users
set raw_app_meta_data = raw_app_meta_data - 'role'
where email in (
  'cheameng@ppnlsc.local',
  'lyvanda@ppnlsc.local',
  'chhaykimhou@ppnlsc.local',
  'songpiseth@ppnlsc.local',
  'srengmengheang@ppnlsc.local',
  'emsouleang@ppnlsc.local',
  'hoursenghout@ppnlsc.local',
  'chhoeunpichviriya@ppnlsc.local',
  'hoksiyean@ppnlsc.local',
  'khamyuen@ppnlsc.local',
  'sornsreyang@ppnlsc.local',
  'embunthon@ppnlsc.local',
  'samsophanna@ppnlsc.local',
  'sophanna@ppnlsc.local'
);

-- ----------------------------------------------------------------------------
-- >>> STOP HERE and create the 14 new accounts in the Dashboard first <<<
--
-- Supabase Dashboard -> Authentication -> Users -> Add user -> Create new user,
-- once per row below. Check "Auto Confirm User" every time (required — these
-- fake @ppnlsc.local addresses can't receive a real confirmation email).
-- Set whatever password you want for each; you can change it later per person.
--
--   cheameng-admin@ppnlsc.local
--   lyvanda-admin@ppnlsc.local
--   chhaykimhou-admin@ppnlsc.local
--   songpiseth-admin@ppnlsc.local
--   srengmengheang-admin@ppnlsc.local
--   emsouleang-admin@ppnlsc.local
--   hoursenghout-admin@ppnlsc.local
--   chhoeunpichviriya-admin@ppnlsc.local
--   hoksiyean-admin@ppnlsc.local
--   khamyuen-admin@ppnlsc.local
--   sornsreyang-admin@ppnlsc.local
--   embunthon-admin@ppnlsc.local
--   samsophanna-admin@ppnlsc.local
--   sophanna-admin@ppnlsc.local
--
-- Once ALL 14 exist, come back and run STEP 2 below in a new query.
-- ----------------------------------------------------------------------------

-- ----------------------------------------------------------------------------
-- STEP 2 — grant admin rights to the new dedicated accounts.
-- If any of the 14 accounts above don't exist yet, this UPDATE simply
-- matches zero rows for that email — harmless, but that person's new
-- account won't have admin rights until you create it and re-run this.
-- ----------------------------------------------------------------------------
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email in (
  'cheameng-admin@ppnlsc.local',
  'lyvanda-admin@ppnlsc.local',
  'chhaykimhou-admin@ppnlsc.local',
  'songpiseth-admin@ppnlsc.local',
  'srengmengheang-admin@ppnlsc.local',
  'emsouleang-admin@ppnlsc.local',
  'hoursenghout-admin@ppnlsc.local',
  'chhoeunpichviriya-admin@ppnlsc.local',
  'hoksiyean-admin@ppnlsc.local',
  'khamyuen-admin@ppnlsc.local',
  'sornsreyang-admin@ppnlsc.local',
  'embunthon-admin@ppnlsc.local',
  'samsophanna-admin@ppnlsc.local',
  'sophanna-admin@ppnlsc.local'
);

-- ----------------------------------------------------------------------------
-- STEP 3 — verify: left column should show role admin ONLY on the *-admin
-- accounts; the original 14 accounts should show no "role" key at all.
-- ----------------------------------------------------------------------------
select email, raw_app_meta_data ->> 'role' as role
from auth.users
where email like '%@ppnlsc.local'
order by role nulls last, email;
