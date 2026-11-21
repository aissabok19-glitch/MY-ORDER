'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { advanceOrder, createOrder, deleteOrder } from '@/app/actions/orders';
import { canMove, STAGE_COUNT } from '@/lib/stages';
import { stageName, type Dict } from '@/lib/dict';
import type { Order, Profile } from '@/lib/types';

export default function OrdersView({ orders, me, d }: { orders: Order[]; me: Profile; d: Dict }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [st, setSt] = useState('');
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => Promise<unknown>) => { setBusy(true); setErr(''); try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };

  // Real-time sync: any change by any user on any device triggers a refresh of this view.
  useEffect(() => {
    const s = supabaseBrowser();
    const ch = s.channel('orders-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => router.refresh())
      .subscribe();
    return () => { s.removeChannel(ch); };
  }, [router]);

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return orders
      .filter((o) => (st === '' || o.stage === +st) &&
        (!k || [o.ref, o.customer_name, o.wilaya ?? '', o.phone ?? '', ...o.order_items.map((i) => i.product)].join(' ').toLowerCase().includes(k)))
      .sort((a, b) => Number(b.priority === 'urgent') - Number(a.priority === 'urgent'));
  }, [orders, q, st]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input className="input !w-auto min-w-0 flex-1" placeholder={d.search} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input !w-auto" value={st} onChange={(e) => setSt(e.target.value)}>
          <option value="">{d.allStages}</option>
          {Array.from({ length: STAGE_COUNT }, (_, i) => <option key={i} value={i}>{stageName(d, i)}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setOpen(!open)}>＋ {d.newOrder}</button>
      </div>

      {open && (
        <form className="card grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); run(async () => { await createOrder(f); setOpen(false); }); }}>
          <input name="customer" className="input" placeholder={d.customer} required />
          <input name="phone" className="input" placeholder={d.phone} inputMode="tel" dir="ltr" />
          <input name="wilaya" className="input" placeholder={d.wilaya} />
          <input name="due" type="date" className="input" aria-label={d.due} />
          <select name="priority" className="input" aria-label={d.priority}><option value="normal">{d.normal}</option><option value="urgent">{d.urgent}</option></select>
          <div className="space-y-2 sm:col-span-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex gap-2">
                <input name="product" className="input" placeholder={d.product} required={i === 0} />
                <input name="qty" type="number" min={1} className="input !w-24" placeholder={d.qty} required={i === 0} />
              </div>
            ))}
          </div>
          <button className="btn btn-primary sm:col-span-2" disabled={busy}>{d.save}</button>
        </form>
      )}

      {err && <p role="alert" className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">{err}</p>}
      {list.length === 0 && <p className="py-10 text-center text-neutral-500">{d.empty}</p>}

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((o) => {
          const done = !!o.delivered_at, mine = canMove(me, o.stage) && !done;
          return (
            <li key={o.id} className={`card flex flex-col gap-2 ${mine ? 'ring-2 ring-blue-500/60' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <b>{o.ref}</b>
                {o.priority === 'urgent' && <span className="rounded bg-red-600 px-2 py-0.5 text-xs text-white">{d.urgent}</span>}
              </div>
              <div className="font-medium">{o.customer_name}</div>
              <div className="text-sm text-neutral-500">{o.wilaya}{o.wilaya && o.phone ? ' · ' : ''}{o.phone && <bdi dir="ltr">{o.phone}</bdi>}</div>
              <ul className="text-sm">{o.order_items.map((i) => <li key={i.id}>{i.product} × {i.qty}</li>)}</ul>
              <div className="flex gap-1" aria-hidden>
                {Array.from({ length: STAGE_COUNT }, (_, i) => <i key={i} className={`h-1.5 flex-1 rounded ${i <= o.stage ? 'bg-blue-600' : 'bg-neutral-200 dark:bg-neutral-700'}`} />)}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{done ? `✓ ${d.delivered}` : stageName(d, o.stage)}</span>
                {o.due_date && <span className="text-neutral-500">{d.due}: {o.due_date}</span>}
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                {mine && <button className="btn btn-primary" disabled={busy} onClick={() => run(() => advanceOrder(o.id))}>{o.stage === 5 ? d.deliver : d.advance}</button>}
                {me.role === 'admin' && <button className="btn" disabled={busy} onClick={() => { if (confirm(d.confirmDelete)) run(() => deleteOrder(o.id)); }}>{d.remove}</button>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
