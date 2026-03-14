# Lazo Automobile

TypeScript + React + Vite implementation of a dealer inventory platform with:

- public listing/search page
- clickable vehicle detail pages
- admin login and protected admin dashboard
- Supabase-ready data/auth/inquiry flow

## Stack

- React 19 + TypeScript
- Vite 8
- React Router
- Supabase JS client

## Current routes

- `/` public inventory page
- `/fahrzeuge/:slug` vehicle detail page
- `/admin/login` admin login
- `/admin` protected admin dashboard

## Local setup

1. Install dependencies:

   npm install

2. Create env file:

   cp .env.example .env

3. Add your Supabase values into `.env`:

   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...

4. Run development server:

   npm run dev

5. Optional checks:

   npm run build
   npm run typecheck
   npm run lint

## Supabase setup

1. Create a Supabase project.
2. Run SQL from `supabase/schema.sql` in SQL Editor.
3. Create your admin user in Supabase Auth.
4. Add that user to `public.admin_users` (SQL example):

   insert into public.admin_users (user_id)
   values ('<AUTH_USER_UUID>');

There is no demo fallback mode. The app uses real Supabase auth/data only.

## Deploy to Vercel

1. Push repository to GitHub.
2. Import project in Vercel.
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy with defaults:
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Notes on free tiers

- Vercel Hobby: free for demo/personal usage.
- Supabase Free: free, but projects can pause after inactivity and have usage limits.
