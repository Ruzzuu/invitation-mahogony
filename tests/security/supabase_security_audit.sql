-- READ-ONLY SUPABASE SECURITY AUDIT
-- Safe to run in Supabase SQL Editor. This file does not modify data or policies.

-- 1. RLS must be enabled on all public-facing invitation tables.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('invitations', 'wishes', 'rsvp')
order by c.relname;

-- Expected:
-- invitations.rls_enabled = true
-- wishes.rls_enabled = true
-- rsvp.rls_enabled = true

-- 2. Inventory all RLS policies and inspect USING / WITH CHECK expressions.
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual as using_expression,
  with_check as insert_update_check
from pg_policies
where schemaname = 'public'
  and tablename in ('invitations', 'wishes', 'rsvp')
order by tablename, cmd, policyname;

-- Expected minimum behavior:
-- invitations: anon may SELECT active invitations only.
-- wishes: anon may SELECT and INSERT for active invitations.
-- rsvp: anon may INSERT only; no public SELECT, UPDATE, or DELETE.

-- 3. Verify table privileges granted to public API roles.
select
  grantee,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('invitations', 'wishes', 'rsvp')
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

-- 4. Boolean privilege matrix. Review any unexpected TRUE value.
select
  role_name,
  table_name,
  has_table_privilege(role_name, format('public.%I', table_name), 'SELECT') as can_select,
  has_table_privilege(role_name, format('public.%I', table_name), 'INSERT') as can_insert,
  has_table_privilege(role_name, format('public.%I', table_name), 'UPDATE') as can_update,
  has_table_privilege(role_name, format('public.%I', table_name), 'DELETE') as can_delete
from (values ('anon'), ('authenticated')) as roles(role_name)
cross join (values ('invitations'), ('wishes'), ('rsvp')) as tables(table_name)
order by role_name, table_name;

-- Critical expected result for anon + rsvp:
-- can_select=false, can_insert=true, can_update=false, can_delete=false.

-- 5. Verify indexes. Wishes should have (invitation_slug, created_at DESC).
select
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('invitations', 'wishes', 'rsvp')
order by tablename, indexname;

-- 6. Verify foreign keys and CHECK constraints.
select
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  pg_get_constraintdef(pc.oid) as definition
from information_schema.table_constraints tc
join pg_constraint pc on pc.conname = tc.constraint_name
join pg_namespace pn on pn.oid = pc.connamespace and pn.nspname = tc.table_schema
where tc.table_schema = 'public'
  and tc.table_name in ('invitations', 'wishes', 'rsvp')
order by tc.table_name, tc.constraint_type, tc.constraint_name;

-- Recommended database-level checks (must appear above):
-- wishes name length 1..100
-- wishes message length 1..1000
-- rsvp name length 1..100
-- rsvp jumlah_tamu 0..10
-- invitation_slug foreign keys to invitations(slug)

-- 7. Check for rows that violate expected validation without exposing message text.
select 'wishes_missing_slug' as check_name, count(*) as invalid_rows
from public.wishes where invitation_slug is null
union all
select 'wishes_blank_name', count(*)
from public.wishes where length(trim(name)) = 0
union all
select 'wishes_blank_message', count(*)
from public.wishes where length(trim(message)) = 0
union all
select 'wishes_name_too_long', count(*)
from public.wishes where char_length(name) > 100
union all
select 'wishes_message_too_long', count(*)
from public.wishes where char_length(message) > 1000
union all
select 'rsvp_missing_slug', count(*)
from public.rsvp where invitation_slug is null
union all
select 'rsvp_blank_name', count(*)
from public.rsvp where length(trim(name)) = 0
union all
select 'rsvp_invalid_guest_count', count(*)
from public.rsvp where jumlah_tamu < 0 or jumlah_tamu > 10
union all
select 'rsvp_absent_with_guests', count(*)
from public.rsvp where hadir = false and jumlah_tamu <> 0;

-- Expected: every invalid_rows value is 0.

-- 8. Confirm invitation separation counts without showing private RSVP names.
select invitation_slug, count(*) as wish_count
from public.wishes
where invitation_slug is not null
group by invitation_slug
order by invitation_slug;

select invitation_slug, count(*) as rsvp_count
from public.rsvp
where invitation_slug is not null
group by invitation_slug
order by invitation_slug;
