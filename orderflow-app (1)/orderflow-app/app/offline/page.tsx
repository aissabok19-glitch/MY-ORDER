import { dict } from '@/lib/dict';
export default function Offline() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6 text-center">
      {(['fr', 'ar'] as const).map((l) => (
        <section key={l} lang={l} dir={l === 'ar' ? 'rtl' : 'ltr'}>
          <h1 className="text-xl font-semibold">{dict[l].offlineTitle}</h1>
          <p className="text-neutral-600 dark:text-neutral-400">{dict[l].offlineText}</p>
        </section>
      ))}
    </main>
  );
}
