'use server';
import { revalidatePath } from 'next/cache';
import { requireActive, requireAdmin } from '@/lib/auth';
import { supabaseServer } from '@/lib/supabase/server';
import { canMove } from '@/lib/stages';

const txt = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

export async function createOrder(f: FormData) {
  await requireActive();
  const customer = txt(f, 'customer');
  const items = f.getAll('product').map((p, i) => ({ product: String(p).trim(), qty: Number(f.getAll('qty')[i]) }))
    .filter((i) => i.product && Number.isInteger(i.qty) && i.qty > 0);
  if (!customer || !items.length) throw new Error('Customer and at least one product are required');
  const { error } = await supabaseServer().rpc('create_order', {
    p_customer: customer, p_phone: txt(f, 'phone') || null, p_wilaya: txt(f, 'wilaya') || null,
    p_priority: txt(f, 'priority') === 'urgent' ? 'urgent' : 'normal', p_due: txt(f, 'due') || null, p_items: items,
  });
  if (error) throw new Error(error.message);
  revalidatePath('/');
}

export async function advanceOrder(id: string) {
  const me = await requireActive();
  const s = supabaseServer();
  const { data: o } = await s.from('orders').select('stage,delivered_at').eq('id', id).single();
  if (!o || o.delivered_at) return;
  if (!canMove(me, o.stage)) throw new Error('Forbidden');           // the DB trigger enforces the same rule
  const patch = o.stage < 5 ? { stage: o.stage + 1 } : { delivered_at: new Date().toISOString() };
  const { error } = await s.from('orders').update(patch).eq('id', id).eq('stage', o.stage);   // guards double clicks
  if (error) throw new Error(error.message);
  revalidatePath('/');
}

export async function deleteOrder(id: string) {
  await requireAdmin();                                               // staff can never delete (also blocked by RLS)
  const { error } = await supabaseServer().from('orders').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
}
