import { redirect } from 'next/navigation';
import { supabaseServer } from './supabase/server';
import type { Profile } from './types';

export async function getProfile(): Promise<Profile | null> {
  const s = supabaseServer();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return null;
  const { data } = await s.from('profiles').select('*').eq('id', user.id).single();
  return (data as Profile) ?? null;
}
// Defense in depth: middleware already gates routes, every page/action re-checks.
export async function requireActive() {
  const p = await getProfile();
  if (!p) return redirect('/login');
  if (!p.is_active) return redirect('/pending');
  return p;
}
export async function requireAdmin() {
  const p = await requireActive();
  if (p.role !== 'admin') return redirect('/');
  return p;
}
