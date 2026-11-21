import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth';
import { getDict } from '@/lib/locale';
import { signOut } from '@/app/actions/auth';
import PendingWatcher from '@/components/PendingWatcher';

export default async function Pending() {
  const me = await getProfile();
  if (!me) redirect('/login');
  if (me.is_active) redirect('/');
  const d = getDict();
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">{d.pendingTitle}</h1>
      <p className="text-neutral-600 dark:text-neutral-400">{d.pendingText}</p>
      <p className="text-sm" dir="ltr">{me.email}</p>
      <form action={signOut}><button className="btn">{d.logout}</button></form>
      <PendingWatcher id={me.id} />
    </main>
  );
}
