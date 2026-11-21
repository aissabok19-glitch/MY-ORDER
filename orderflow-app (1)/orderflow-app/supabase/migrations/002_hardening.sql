-- Applied after 001 (already applied on your Supabase project). Fixes the Supabase security-advisor findings.
alter function public.create_order(text, text, text, text, date, jsonb) set search_path = public;

-- trigger functions never need to be callable through the API
revoke execute on function public.enforce_stage_owner(), public.handle_new_user(), public.log_order_event() from public, anon, authenticated;

-- RLS helpers: signed-in users need them (policies run with the caller's rights), visitors do not
revoke execute on function public.is_active_user(), public.is_admin() from public, anon;
revoke execute on function public.create_order(text, text, text, text, date, jsonb) from public, anon;
