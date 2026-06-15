# Phnom Penh New Life Student Center — Live App

Static frontend (Khmer) + Supabase backend (Postgres, Auth, Storage, Realtime).
Deployed via **GitHub → Cloudflare Pages** (push to deploy).

## Project files

| File | Purpose |
|---|---|
| `index.html` | The whole UI |
| `supabase-config.js` | Project URL + anon key (public, safe to commit) |
| `supabase-integration.js` | Live data layer: load / save / realtime / auth / upload |
| `schema.sql` | One-time DB setup (run in Supabase SQL Editor) |
| `leaders/`, `fonts/`, `picture1.png` | Static assets |

## One-time backend setup (Supabase)

1. Create project at supabase.com (region: Singapore).
2. SQL Editor → run `schema.sql`.
3. Storage → create **public** bucket named `memories` → run the two storage policies (see `MIGRATION-GUIDE.md` Step 3).
4. Authentication → Users → add a staff user (email + password).
5. Project Settings → API → copy **Project URL** + **anon public** key into `supabase-config.js`.

## Push to GitHub

```bash
cd PPNLSC-supabase
git init
git add .
git commit -m "Initial: PPNLSC live app (Supabase)"
git branch -M main
git remote add origin https://github.com/<your-username>/ppnlsc.git
git push -u origin main
```

(Create the empty `ppnlsc` repo on github.com first — no README/.gitignore, this repo already has them.)

## Connect Cloudflare Pages (Git)

1. dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Authorize GitHub, pick the `ppnlsc` repo.
3. Build settings — **this is the part that matters for a static site**:

   | Setting | Value |
   |---|---|
   | Framework preset | **None** |
   | Build command | *(leave empty)* |
   | Build output directory | `/` *(repo root — where `index.html` is)* |
   | Root directory | *(leave empty)* |

4. **Save and Deploy** → live at `https://ppnlsc.pages.dev`.

> If your files end up in a subfolder inside the repo, set **Root directory** to that folder instead.

## Updating later

```bash
# edit files, then:
git add .
git commit -m "what changed"
git push
```

Cloudflare auto-builds and publishes within ~30s. Roll back anytime from the Pages **Deployments** tab.

## Custom domain

Pages project → **Custom domains** → **Set up a custom domain** → enter your domain.
If the domain's nameservers are on Cloudflare, it connects automatically with HTTPS.

## Content management (no redeploy needed)

- Students / attendance / photos: edit live after signing in as staff.
- Week dates (the 4 Fridays): edit the `weeks` table in Supabase Table Editor.
- Leaders / Bible verses / UI: edit `index.html` → `git push`.

## Security

- Writes are enforced by Postgres **RLS** — visitors can't edit by tampering with the page.
- Only the **anon/publishable** key is in the frontend. Keep `service_role`/secret keys out of the repo.
- Remove a staff member: delete their user in Supabase → Authentication → Users.
