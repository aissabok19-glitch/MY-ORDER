'use server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { DEPTS, type Dept, type Profile, type Role } from '@/lib/types';

async function update(id: string, patch: Partial<Profile>) {
  const me = await requireAdmin();
  if (id === me.id) throw new Error('You cannot change your own account');     // avoids locking yourself out
  const { error } = await supabaseServer().from('profiles').update(patch).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
}
export async function setActive(id: string, active: boolean) { await update(id, { is_active: !!active }); }
export async function setRole(id: string, role: Role) {
  if (role !== 'admin' && role !== 'staff') throw new Error('Invalid role');
  await update(id, { role });
}
export async function setDepartment(id: string, dept: Dept | null) {
  if (dept !== null && !DEPTS.includes(dept)) throw new Error('Invalid department');
  await update(id, { department: dept });
}
