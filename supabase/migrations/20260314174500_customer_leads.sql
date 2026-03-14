create table if not exists public.customer_leads (
  email text primary key,
  name text,
  phone text,
  lifecycle_status text not null default 'new' check (lifecycle_status in ('new', 'qualified', 'customer', 'inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_leads enable row level security;

drop policy if exists "Admins can read customer leads" on public.customer_leads;

create policy "Admins can read customer leads"
  on public.customer_leads
  for select
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can insert customer leads" on public.customer_leads;

create policy "Admins can insert customer leads"
  on public.customer_leads
  for insert
  with check (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can update customer leads" on public.customer_leads;

create policy "Admins can update customer leads"
  on public.customer_leads
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

drop policy if exists "Admins can delete customer leads" on public.customer_leads;

create policy "Admins can delete customer leads"
  on public.customer_leads
  for delete
  using (
    exists (
      select 1
      from public.admin_users au
      where au.user_id = auth.uid()
    )
  );
