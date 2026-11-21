import { requireActive } from '@/lib/auth';
import { getDict, getLocale } from '@/lib/locale';
import { supabaseServer } from '@/lib/supabase/server';
import Header from '@/components/Header';
import OrdersView from '@/components/OrdersView';
import type { Order } from '@/lib/types';

export default async function Home() {
  const me = await requireActive();
  const { data } = await supabaseServer().from('orders').select('*, order_items(id,product,qty)').order('created_at', { ascending: false }).limit(500);
  return (
    <>
      <Header me={me} d={getDict()} locale={getLocale()} />
      <main className="mx-auto max-w-6xl p-4"><OrdersView orders={(data ?? []) as Order[]} me={me} d={getDict()} /></main>
    </>
  );
}
