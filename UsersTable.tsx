'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { setActive, setDepartment, setRole } from '@/app/actions/admin';
import { DEPTS, type Dept, type Profile, type Role } from '@/lib/types';
import type { Dict } from '@/lib/dict';

export default function UsersTable({ users, me, d }: { users: Profile[]; me: Profile; d: Dict }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const run = async (fn: () => Promise<unknown>) => { setBusy(true); setErr(''); try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };

  useEffect(() => {      // new sign-ups appear instantly on the admin's screen
    const s = supabaseBrowser();
    const ch = s.channel('profiles-live').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => router.refresh()).subscribe();
    return () => { s.removeChannel(ch); };
  }, [router]);

  const waiting = users.filter((u) => !u.is_active).length;
  return (
    <div className="space-y-3">
      {waiting > 0 && <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">{d.pendingUsers}: {waiting}</p>}
      {err && <p role="alert" className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-200">{err}</p>}
      <ul className="grid gap-3 md:grid-cols-2">
        {users.map((u) => {
          const self = u.id === me.id;
          return (
            <li key={u.id} className="card flex flex-col gap-3">
              <div>
                <div className="font-medium">{u.full_name || u.email} {self && <span className="text-neutral-500">{d.you}</span>}</div>
                <div className="text-sm text-neutral-500" dir="ltr">{u.email}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select className="input !w-auto" aria-label={d.role} value={u.role} disabled={self || busy} onChange={(e) => run(() => setRole(u.id, e.target.value as Role))}>
                  <option value="staff">{d.roleStaff}</option><option value="admin">{d.roleAdmin}</option>
                </select>
                <select className="input !w-auto" aria-label={d.department} value={u.department ?? ''} disabled={self || busy} onChange={(e) => run(() => setDepartment(u.id, (e.target.value || null) as Dept | null))}>
                  <option value="">{d.noDept}</option>
                  {DEPTS.map((k) => <option key={k} value={k}>{d[`d_${k}` as keyof Dict]}</option>)}
                </select>
                <button className={`btn ${u.is_active ? '' : 'btn-primary'}`} disabled={self || busy} onClick={() => run(() => setActive(u.id, !u.is_active))}>{u.is_active ? d.deactivate : d.activate}</button>
                <span className={`text-xs ${u.is_active ? 'text-green-600' : 'text-amber-600'}`}>{u.is_active ? d.active : d.inactive}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
