'use client';
import { useEffect, useState } from 'react';
type InstallEvent = Event & { prompt: () => Promise<void> };

export default function SwRegister({ label }: { label: string }) {
  const [ev, setEv] = useState<InstallEvent | null>(null);
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') navigator.serviceWorker.register('/sw.js').catch(() => {});
    const h = (e: Event) => { e.preventDefault(); setEv(e as InstallEvent); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  if (!ev) return null;
  return <button className="btn btn-primary fixed bottom-4 end-4 z-20 shadow-lg" onClick={async () => { await ev.prompt(); setEv(null); }}>{label}</button>;
}
