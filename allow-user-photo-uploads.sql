-- ============================================================================
-- Allow ANY signed-in user to upload photos/videos to Memories.
--
-- Previously "memories: admin can write" / "memories bucket: admin can write"
-- covered INSERT + UPDATE + DELETE all together, admin-only. This splits
-- that into:
--   INSERT  -> any signed-in user          (uploading a new photo/video)
--   UPDATE  -> admin only                  (editing captions, via admin.html)
--   DELETE  -> admin only                  (removing a memory, via admin.html)
--
-- Run this once in the Supabase SQL editor. Safe to re-run.
-- ============================================================================

-- ---------- public.memories (the row: type, storage_path, caption) ----------
drop policy if exists "memories: admin can write" on public.memories;
drop policy if exists "memories: any signed-in user can insert" on public.memories;
drop policy if exists "memories: admin can update" on public.memories;
drop policy if exists "memories: admin can delete" on public.memories;

create policy "memories: any signed-in user can insert"
  on public.memories for insert
  to authenticated
  with check (true);

create policy "memories: admin can update"
  on public.memories for update
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "memories: admin can delete"
  on public.memories for delete
  to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- storage.objects (the actual uploaded file, bucket 'memories') ----------
drop policy if exists "memories bucket: admin can write" on storage.objects;
drop policy if exists "memories bucket: any signed-in user can upload" on storage.objects;
drop policy if exists "memories bucket: admin can update" on storage.objects;
drop policy if exists "memories bucket: admin can delete" on storage.objects;

create policy "memories bucket: any signed-in user can upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'memories');

create policy "memories bucket: admin can update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'memories' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check (bucket_id = 'memories' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "memories bucket: admin can delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'memories' and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------- verify ----------
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'memories'
union all
select policyname, cmd, roles
from pg_policies
where schemaname = 'storage' and tablename = 'objects' and policyname like 'memories bucket%'
order by 1;
