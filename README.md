# OrderFlow

Order lifecycle tracking (Client → Sales → Production → Warehouse → Accounting → Delivery) for several users on phones and computers, with live sync.

## Stack
| Layer | Choice | Why |
|---|---|---|
| App | Next.js 14 (App Router) + TypeScript + Tailwind | one codebase for UI and server logic, easy Vercel deploy |
| Database / Auth / Realtime | Supabase (PostgreSQL) | central database, login, live updates, Row Level Security |
| Installable app | PWA (manifest + service worker) | installs on Windows/Mac/Android/iOS without app stores |

## Structure
```
app/                 pages (routes) and app/actions/* = server actions (business logic + permission checks)
components/          UI only (client components call server actions, never the database directly for writes)
lib/supabase/        browser / server / middleware clients      lib/auth.ts  requireActive(), requireAdmin()
lib/stages.ts        stage ownership rules (who can move what)   lib/dict.ts  French + Arabic texts
middleware.ts        session refresh, login redirect, pending-activation gate, admin-only gate
supabase/migrations/ database schema, triggers and Row Level Security policies
public/sw.js         service worker      app/manifest.ts   PWA manifest      public/icons/  app icons
```
Add a feature (invoicing, analytics…): new table in a new `supabase/migrations/00X_*.sql` (with RLS), new `app/actions/<feature>.ts`, new page + component.

## Security model (three layers)
1. **Middleware**: no session → `/login`; inactive account → `/pending`; `/admin` only for admins.
2. **Server actions** re-check the profile (`requireActive` / `requireAdmin`).
3. **Database (RLS + triggers)**: the real barrier. Inactive users read nothing; staff cannot delete orders or change profiles; only the department that owns a stage (or an admin) can move an order out of it.

The browser only holds the public anon key. The `service_role` key is not used anywhere. Never commit `.env.local`.

## 1. Set up Supabase (10 min)
> **Already done for your project** (`ofixrobxjyydqbdlzpvs`): migrations 001 and 002 are applied and tested. `.env.local` is pre-filled. Only steps 3 and 4 below (Auth settings) remain.

1. Create a project at supabase.com.
2. **SQL Editor** → paste `001_init.sql` then `002_hardening.sql` → Run.
3. **Authentication → Providers → Email**: keep enabled. For simple testing turn **Confirm email** off; in production leave it on.
4. **Authentication → URL Configuration**: set *Site URL* to your production URL and add `http://localhost:3000` to *Redirect URLs*.
5. **Project Settings → API**: copy the Project URL and the `anon public` key.

## 2. Run locally
```bash
cp .env.example .env.local      # fill in the two values
npm install
npm run dev                     # http://localhost:3000
```
The **first account created becomes the active admin automatically**. Every account after that starts inactive until an admin activates it in **Users**.

## 3. Deploy (Vercel + Supabase)
1. Push this folder to a GitHub repository.
2. vercel.com → *Add New Project* → import it (framework is detected as Next.js).
3. *Environment Variables*: add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy, then put the Vercel URL in Supabase *Site URL* (step 1.4).
5. Sign up on the live site first (you become admin), then have employees sign up and activate them.

Render works too: *New Web Service* → build `npm install && npm run build` → start `npm start` → same two variables. HTTPS is required for installation and is provided by both.

## 4. Install on devices
- **Windows / Mac / Linux (Chrome or Edge)**: open the site → install icon in the address bar (or the *Install the application* button shown by the app). Safari on macOS: *File → Add to Dock*.
- **Android (Chrome)**: menu ⋮ → *Install app* / *Add to Home screen*.
- **iPhone / iPad**: open in **Safari** → Share → *Add to Home Screen*. (iOS only supports this from Safari.)

A native Tauri/Electron wrapper is not needed: the PWA already runs as a standalone window. Consider one only if you later need USB/printer/file-system access.

## 5. Test checklist
- [ ] Sign up the first account → lands on Orders, **Users** link visible (admin).
- [ ] Sign up a second account (other browser/phone) → sees *Pending activation*.
- [ ] As admin: *Users* shows the new account at the top → set department → **Activate** → the other device enters the app within seconds, without reloading.
- [ ] Create an order on device A → it appears on device B without refresh.
- [ ] As staff in *Sales*: can advance stages 1–2, but the button is absent/refused on Production.
- [ ] As staff: no *Delete* button; a direct delete attempt is rejected by the database.
- [ ] Deactivate the staff account → next request sends them back to *Pending activation*.
- [ ] Language button switches French ⇄ Arabic and flips the layout RTL/LTR.
- [ ] Chrome DevTools → Application → Manifest shows no errors; Lighthouse → PWA installable; stop the network → the offline page appears.
- [ ] Install on one phone and one computer and open from the icon.

## Not included yet (ported from the prototype later)
Kanban drag-and-drop view, side drawer with audit trail (data is already recorded in `order_events`), urgent-order alarm, incident declaration, WhatsApp delivery receipt, Excel export, Algerian regions table, daily 08:00 reminder (needs push notifications + a scheduled Edge Function).
