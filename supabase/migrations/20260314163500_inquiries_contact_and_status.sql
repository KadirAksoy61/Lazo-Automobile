alter table public.inquiries
  alter column vehicle_id drop not null;

alter table public.inquiries
  drop constraint if exists inquiries_vehicle_id_fkey;

alter table public.inquiries
  add constraint inquiries_vehicle_id_fkey
  foreign key (vehicle_id)
  references public.vehicles(id)
  on delete set null;

drop policy if exists "Admins can update inquiries" on public.inquiries;

create policy "Admins can update inquiries"
  on public.inquiries
  for update
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
