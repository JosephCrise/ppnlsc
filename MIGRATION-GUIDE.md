# PPNLSC — Static → Live App (Supabase + Domain + Host)

Turns the static site into a real app: shared database, live updates across all visitors, staff-only editing, persistent photo uploads, and a custom domain.

## Architecture

```
Browser (index.html, your existing UI)
   │  @supabase/supabase-js
   ▼
Supabase
   ├─ Postgres        students · attendance · weeks · memories
   ├─ Row Level Sec.  public READ · authenticated (staff) WRITE
   ├─ Realtime        change on any row → pushed to every open browser
   ├─ Auth            staff email/password sign-in
   └─ Storage         "memories" bucket (uploaded photos/videos)

Host: Vercel or Netlify (static files) + custom domain
```

What is public vs. locked:

| Area | Public (not signed in) | Staff (signed in) |
|---|---|---|
| Home, Leaders, Verses, Permission letter | view | view |
| Students, Attendance, Memories | **view only** | view + **edit / add / upload** |

"Last updated" timestamp is read from the DB and shown on the Students and Attendance panels, so anyone opening the page sees how current the data is.

---

## Files in this folder

| File | Purpose |
|---|---|
| `index.html` | Your UI, now wired to Supabase (head includes added, edit handlers persist) |
| `supabase-config.js` | **You edit this** — project URL + anon key |
| `supabase-integration.js` | Live data layer (load, save, realtime, auth, upload) |
| `schema.sql` | Run once in Supabase to create tables, security, seed students |
| `leaders/`, `fonts/`, `picture1.png` | Static assets (unchanged) |
| `memories/` | Empty — photos now live in Supabase Storage |

---

## Step 1 — Create the Supabase project

1. Go to `https://supabase.com` → sign up (free) → **New project**.
2. Pick a name, a strong DB password, region **Singapore** (closest to Cambodia).
3. Wait ~2 min for provisioning.

## Step 2 — Create the database

1. Left sidebar → **SQL Editor** → **New query**.
2. Paste the entire contents of `schema.sql` → **Run**.
3. Confirm: **Table Editor** shows `students` (38 rows), `attendance` (152 rows), `weeks` (4), `memories` (0).

## Step 3 — Create the Storage bucket (photos/videos)

1. Sidebar → **Storage** → **New bucket** → name it exactly `memories` → toggle **Public bucket** ON → Create.
2. Sidebar → **SQL Editor** → run this so only staff can upload (public can view):

```sql
create policy "public read memories bucket"
  on storage.objects for select
  using (bucket_id = 'memories');

create policy "staff upload memories bucket"
  on storage.objects for insert
  with check (bucket_id = 'memories' and auth.role() = 'authenticated');
```

## Step 4 — Create staff login(s)

1. Sidebar → **Authentication** → **Users** → **Add user** → enter the responsible person's email + password → Create.
2. (Optional) Sidebar → **Authentication** → **Providers** → **Email**: turn **Confirm email** OFF for the simplest flow, or leave ON and confirm via the link.
3. Add one user per staff member who should be allowed to edit.

> Anyone with a Supabase user here = staff = can edit. Everyone else = read-only. That is the page-level access control you asked for, enforced on the **server** (RLS), so it cannot be bypassed in the browser.

## Step 5 — Plug in your keys

1. Sidebar → **Project Settings** → **API**.
2. Copy **Project URL** and **anon public** key.
3. Open `supabase-config.js` and replace the two placeholders:

```js
const SB_URL      = "https://abcdxyz.supabase.co";
const SB_ANON_KEY = "eyJhbGciOi...";   // the long anon public key
```

The anon key is safe to ship in the browser — RLS is what protects the data.

## Step 6 — Test locally

Browsers block `fetch` from `file://`, so serve the folder:

```bash
cd PPNLSC-supabase
python3 -m http.server 8080
# open http://localhost:8080
```

Check: students/attendance load from DB; click **🔒 ដោះសោ** → sign in with your staff account → mark attendance → open the same page in a second tab → it updates live. Upload a photo in Memories → it persists after refresh.

---

## Step 7 — Host it (free)

Either host works; both give HTTPS automatically. The whole folder is static.

### Option A — Netlify (drag & drop, no account-CLI needed)
1. `https://app.netlify.com` → **Add new site** → **Deploy manually**.
2. Drag the `PPNLSC-supabase` folder onto the page. Done — you get a `*.netlify.app` URL.

### Option B — Vercel (Git-based, nicer for updates)
1. Push this folder to a GitHub repo.
2. `https://vercel.com` → **New Project** → import the repo → **Deploy**. No build step (it's static).

## Step 8 — Custom domain

1. **Buy a domain** (~$10–15/yr): Namecheap, Cloudflare Registrar (cheapest, at-cost), or Porkbun. A `.org` or `.center` suits a student center; `.com` is fine too.
2. In **Netlify**: Site → **Domain management** → **Add a domain** → enter your domain → follow the DNS records shown.
   In **Vercel**: Project → **Settings → Domains** → add domain → copy the records.
3. At your registrar, add the records they give you:
   - Apex (`yourdomain.org`) → an **A record** to the host's IP, or use the registrar's ALIAS/ANAME.
   - `www` → a **CNAME** to the host's target.
   - Easiest path: set the domain's nameservers to **Cloudflare** (free) and manage DNS there; both hosts document this.
4. HTTPS certificate is issued automatically within minutes. Visit `https://yourdomain.org`.

---

## Cost

| Item | Cost |
|---|---|
| Supabase | Free tier (500 MB DB, 1 GB storage, 50k monthly active users) — ample here |
| Hosting (Netlify/Vercel) | Free tier |
| Domain | ~$10–15 / year |

## Updating content later

- **Students / attendance / photos**: edit in the live site after signing in — no redeploy.
- **Leaders, Bible verses, week labels**: leaders/verses are still in `index.html`; the 4 Fridays are in the `weeks` table (editable in Supabase Table Editor, or make staff-editable later).
- **UI / code changes**: edit files → redeploy (drag to Netlify again, or `git push` for Vercel).

## Security notes

- All writes are gated by Postgres **RLS**, not by the old client-side passcode — a visitor cannot edit by tampering with the page.
- Keep the **service_role** key (Settings → API) secret; never put it in the frontend. Only the **anon** key goes in `supabase-config.js`.
- To revoke a staff member: delete their user in Authentication → Users.

## Optional next steps

- Make `weeks` and leaders editable from the UI (same pattern as students).
- Add an audit column (`updated_by`) using `auth.uid()` to see who changed what.
- Roll the term forward by updating the 4 rows in `weeks` and clearing attendance.
