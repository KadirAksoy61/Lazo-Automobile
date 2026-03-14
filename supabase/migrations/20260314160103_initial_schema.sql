create extension if not exists pgcrypto;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  brand text not null,
  model text not null,
  price_eur integer not null,
  year integer not null,
  mileage_km integer not null,
  power_ps integer not null,
  fuel_type text not null,
  transmission text not null,
  drivetrain text,
  body_type text,
  color text,
  first_registration date,
  description text,
  image_urls text[] not null default '{}',
  status text not null default 'available' check (status in ('available', 'reserved', 'sold')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  name text not null,
  email text not null,
  message text not null,
  phone text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.vehicles enable row level security;
alter table public.inquiries enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Public can read available vehicles" on public.vehicles;

create policy "Public can read available vehicles"
  on public.vehicles
  for select
  using (status = 'available');

drop policy if exists "Admin can manage vehicles" on public.vehicles;

drop policy if exists "Admins can manage vehicles" on public.vehicles;

create policy "Admins can manage vehicles"
  on public.vehicles
  for all
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

drop policy if exists "Public can create inquiries" on public.inquiries;

create policy "Public can create inquiries"
  on public.inquiries
  for insert
  with check (true);

drop policy if exists "Admin can read inquiries" on public.inquiries;

drop policy if exists "Admins can read inquiries" on public.inquiries;

create policy "Admins can read inquiries"
  on public.inquiries
  for select
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

drop policy if exists "Admin users can read own role" on public.admin_users;

create policy "Admin users can read own role"
  on public.admin_users
  for select
  using (auth.uid() = user_id);
