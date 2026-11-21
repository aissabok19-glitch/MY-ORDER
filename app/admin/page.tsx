import { requireAdmin } from '@/lib/auth';
import { getDict, getLocale } from '@/lib/locale';
import { supabaseServer } from '@/lib/supabase/server';
import Header from '@/components/Header';
import UsersTable from '@/components/UsersTable';
import type { Profile } from '@/lib/types';

export default async function Admin() {
  const me = await requireAdmin();
  const { data } = await supabaseServer().from('profiles').select('*').order('is_active', { ascending: true }).order('created_at', { ascending: false });
  return (
    <>
      <Header me={me} d={getDict()} locale={getLocale()} />
      <main className="mx-auto max-w-6xl p-4"><UsersTable users={(data ?? []) as Profile[]} me={me} d={getDict()} /></main>
    </>
  );
}
