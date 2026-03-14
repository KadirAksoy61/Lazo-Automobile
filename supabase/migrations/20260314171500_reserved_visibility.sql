drop policy if exists "Public can read available vehicles" on public.vehicles;

create policy "Public can read available vehicles"
  on public.vehicles
  for select
  using (status in ('available', 'reserved'));
