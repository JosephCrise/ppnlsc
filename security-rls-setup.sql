-- ============================================================
-- Lock the database down so login actually protects the data,
-- and so only "admin" accounts can modify anything.
--
-- WHY THIS IS NEEDED:
-- The website uses a public "anon" key (visible to anyone in
-- supabase-config.js — that's normal and expected for Supabase).
-- The login screen and the "admin-only edit" buttons on the site
-- are a UI gate only. Without the policies below, ANY signed-in
-- account (or even the anon key directly) could call the Supabase
-- REST API and edit/delete data, regardless of what the UI shows.
-- Row Level Security (RLS) is what actually enforces "must be
-- signed in" (and "must be an admin") at the database itself, no
-- matter how the request is made.
--
-- HOW ROLES WORK:
-- Every account can read (view) once signed in. Only an account
-- with app_metadata.role = "admin" can write (add/edit/delete).
-- app_metadata is the right place for this because it can ONLY be
-- changed by an admin via SQL/Studio — a regular signed-in user
-- CANNOT grant it to themselves (unlike user_metadata, which any
-- user can rewrite on themselves via the client SDK).
--
-- ONE-TIME SETUP:
-- 1. Open your Supabase project -> SQL Editor -> "New query".
-- 2. BEFORE running this: go to Table Editor -> students (then
--    attendance, memories, permissions) -> the "RLS policies" tab
--    for each table, and delete any existing policy that grants
--    the "anon" role SELECT/read/write access. This file assumes
--    a clean slate; it won't remove policies you already have.
-- 3. Paste this WHOLE file into the SQL Editor and click "Run".
-- 4. Also do the Storage step, and the "grant admin" step, below.
-- ============================================================

-- ---------- students ----------
alter table public.students enable row level security;

create policy "students: any signed-in user can read"
  on public.students for select
  to authenticated
  using (true);

create policy "students: admin can write"
  on public.students for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- attendance ----------
alter table public.attendance enable row level security;

create policy "attendance: any signed-in user can read"
  on public.attendance for select
  to authenticated
  using (true);

create policy "attendance: admin can write"
  on public.attendance for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- memories ----------
alter table public.memories enable row level security;

create policy "memories: any signed-in user can read"
  on public.memories for select
  to authenticated
  using (true);

create policy "memories: admin can write"
  on public.memories for all
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- permissions ----------
-- Nothing is public here, on purpose: submitting a request requires a
-- signed-in account, same as every other part of the site. Any signed-in
-- account can submit and view the list; only an admin can edit/delete it.
alter table public.permissions enable row level security;

create policy "permissions: any signed-in user can submit a request"
  on public.permissions for insert
  to authenticated
  with check (true);

create policy "permissions: any signed-in user can read"
  on public.permissions for select
  to authenticated
  using (true);

create policy "permissions: admin can update"
  on public.permissions for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "permissions: admin can delete"
  on public.permissions for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- STORAGE: make the "memories" bucket private
-- ============================================================
-- The app now requests signed URLs (1-hour expiry) instead of public
-- URLs for photos/videos. That only matters if the bucket itself is
-- private — a "public" bucket serves files to anyone with the link
-- regardless of RLS or login. Run this to flip it private:

update storage.buckets set public = false where id = 'memories';

-- Any signed-in user can view memories; only admin can upload/delete.
create policy "memories bucket: any signed-in user can read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'memories');

create policy "memories bucket: admin can write"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'memories' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check (bucket_id = 'memories' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================================
-- GRANT / REVOKE the admin role for a specific account
-- ============================================================
-- Run this once per person who should be able to edit (change the
-- email to match the account you created in Authentication -> Users).
-- Everyone else who logs in can view but not edit.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email = 'sreyang@ppnlsc.local';   -- <-- change this to the account you're promoting

-- To demote someone back to view-only:
-- update auth.users
-- set raw_app_meta_data = raw_app_meta_data - 'role'
-- where email = 'sreyang@ppnlsc.local';

-- IMPORTANT: if that person is already logged in when you run this,
-- their browser is still holding an old token without the role. They
-- need to sign out and back in (or just wait — the session
-- auto-refreshes periodically) before the new role takes effect.

-- ============================================================
-- VERIFY (run these after, in a new query, to sanity-check):
--   select email, raw_app_meta_data from auth.users;   -- confirm who has role=admin
--   select * from public.students limit 1;             -- should error/empty when NOT logged in
-- Test the anon (logged-out) and non-admin behavior using your site
-- in a private/incognito window, not the SQL Editor (the SQL Editor
-- runs as an elevated role, not anon/authenticated, so it will
-- always succeed there regardless of these policies).
-- ============================================================
