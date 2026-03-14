create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, vehicle_id)
);

alter table public.wishlists enable row level security;

drop policy if exists "Users can read own wishlist" on public.wishlists;

create policy "Users can read own wishlist"
  on public.wishlists
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own wishlist" on public.wishlists;

create policy "Users can insert own wishlist"
  on public.wishlists
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlist" on public.wishlists;

create policy "Users can delete own wishlist"
  on public.wishlists
  for delete
  using (auth.uid() = user_id);
