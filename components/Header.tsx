import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import LangToggle from './LangToggle';
import type { Dict, Locale } from '@/lib/dict';
import type { Profile } from '@/lib/types';

export default function Header({ me, d, locale }: { me: Profile; d: Dict; locale: Locale }) {
  return (
    <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2">
        <Link href="/" className="font-semibold">{d.app}</Link>
        <nav className="flex gap-3 text-sm">
          <Link href="/">{d.orders}</Link>
          {me.role === 'admin' && <Link href="/admin">{d.users}</Link>}
        </nav>
        <span className="flex-1" />
        <LangToggle locale={locale} />
        <form action={signOut}><button className="btn">{d.logout}</button></form>
      </div>
    </header>
  );
}
