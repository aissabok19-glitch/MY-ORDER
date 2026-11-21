-- OrderFlow schema. Run once in Supabase > SQL Editor (or `supabase db push`).

create type app_role as enum ('admin', 'staff');
create type app_dept as enum ('sales', 'factory', 'warehouse', 'accountant', 'logistics');

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        app_role not null default 'staff',
  department  app_dept,
  is_active   boolean not null default false,          -- accounts start disabled
  created_at  timestamptz not null default now()
);

create sequence public.order_seq start 2611;

create table public.orders (
  id            uuid primary key default gen_random_uuid(),
  ref           text unique not null default ('CMD-' || nextval('public.order_seq')),
  customer_name text not null check (length(trim(customer_name)) > 0),
  phone         text,
  wilaya        text,
  priority      text not null default 'normal' check (priority in ('normal', 'urgent')),
  stage         smallint not null default 0 check (stage between 0 and 5),
  due_date      date,
  delivered_at  timestamptz,
  created_by    uuid not null default auth.uid() references public.profiles(id),
  created_at    timestamptz not null default now()
);
create index orders_stage_idx on public.orders (stage);

create table public.order_items (
  id        uuid primary key default gen_random_uuid(),
  order_id  uuid not null references public.orders(id) on delete cascade,
  product   text not null check (length(trim(product)) > 0),
  qty       integer not null check (qty > 0)
);
create index order_items_order_idx on public.order_items (order_id);

create table public.order_events (                      -- audit trail
  id          bigserial primary key,
  order_id    uuid not null references public.orders(id) on delete cascade,
  actor       uuid references public.profiles(id) default auth.uid(),
  from_stage  smallint,
  to_stage    smallint,
  created_at  timestamptz not null default now()
);

-- Helpers (security definer so RLS policies can read profiles without recursion)
create function public.is_active_user() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce((select is_active from profiles where id = auth.uid()), false) $$;

create function public.is_admin() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce((select is_active and role = 'admin' from profiles where id = auth.uid()), false) $$;

-- New sign-ups: inactive staff. Bootstrap: the very first account becomes the active admin.
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare first_user boolean;
begin
  select not exists (select 1 from profiles where role = 'admin') into first_user;
  insert into profiles (id, email, full_name, role, is_active)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name',
          case when first_user then 'admin'::app_role else 'staff'::app_role end, first_user);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Only the department that owns a stage (or an admin) can move an order out of it / confirm delivery.
create function public.enforce_stage_owner() returns trigger language plpgsql security definer set search_path = public as $$
declare d app_dept; ok boolean;
begin
  if (new.stage is distinct from old.stage or new.delivered_at is distinct from old.delivered_at) and not public.is_admin() then
    select department into d from profiles where id = auth.uid();
    ok := (old.stage in (0, 1) and d = 'sales') or (old.stage = 2 and d = 'factory') or (old.stage = 3 and d = 'warehouse')
       or (old.stage = 4 and d = 'accountant') or (old.stage = 5 and d = 'logistics');
    if not ok then raise exception 'You cannot move this order from its current stage'; end if;
  end if;
  return new;
end $$;
create trigger orders_stage_owner before update on public.orders for each row execute function public.enforce_stage_owner();

create function public.log_order_event() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then insert into order_events (order_id, to_stage) values (new.id, new.stage);
  elsif new.stage is distinct from old.stage then insert into order_events (order_id, from_stage, to_stage) values (new.id, old.stage, new.stage);
  end if;
  return new;
end $$;
create trigger orders_audit after insert or update on public.orders for each row execute function public.log_order_event();

-- Row Level Security
alter table public.profiles     enable row level security;
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
alter table public.order_events enable row level security;

create policy profiles_read   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_admin  on public.profiles for update using (public.is_admin()) with check (public.is_admin());

create policy orders_read     on public.orders for select using (public.is_active_user());
create policy orders_insert   on public.orders for insert with check (public.is_active_user() and created_by = auth.uid());
create policy orders_update   on public.orders for update using (public.is_active_user()) with check (public.is_active_user());
create policy orders_delete   on public.orders for delete using (public.is_admin());          -- staff cannot delete

create policy items_read      on public.order_items for select using (public.is_active_user());
create policy items_insert    on public.order_items for insert with check (public.is_active_user());
create policy items_update    on public.order_items for update using (public.is_active_user());
create policy items_delete    on public.order_items for delete using (public.is_admin());

create policy events_read     on public.order_events for select using (public.is_active_user());   -- written by trigger only

-- Realtime (changes are filtered by the policies above)
alter publication supabase_realtime add table public.orders, public.order_items, public.profiles;

-- Create an order and its items atomically (runs with the caller's rights, so RLS still applies)
create function public.create_order(p_customer text, p_phone text, p_wilaya text, p_priority text, p_due date, p_items jsonb)
returns uuid language plpgsql as $$
declare oid uuid;
begin
  insert into orders (customer_name, phone, wilaya, priority, due_date)
  values (p_customer, p_phone, p_wilaya, p_priority, p_due) returning id into oid;
  insert into order_items (order_id, product, qty)
  select oid, i ->> 'product', (i ->> 'qty')::int from jsonb_array_elements(p_items) i;
  return oid;
end $$;
