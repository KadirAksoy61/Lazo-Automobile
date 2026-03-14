insert into storage.buckets (id, name, public)
values ('vehicle-images', 'vehicle-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read vehicle images" on storage.objects;

create policy "Public can read vehicle images"
  on storage.objects
  for select
  using (bucket_id = 'vehicle-images');

drop policy if exists "Admins can upload vehicle images" on storage.objects;

create policy "Admins can upload vehicle images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'vehicle-images'
    and exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can update vehicle images" on storage.objects;

create policy "Admins can update vehicle images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'vehicle-images'
    and exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'vehicle-images'
    and exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can delete vehicle images" on storage.objects;

create policy "Admins can delete vehicle images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'vehicle-images'
    and exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );
