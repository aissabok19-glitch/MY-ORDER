'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';

// Sends the user into the app the moment an admin activates the account (realtime + 15 s fallback).
export default function PendingWatcher({ id }: { id: string }) {
  const router = useRouter();
  useEffect(() => {
    const s = supabaseBrowser();
    const ch = s.channel(`me-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${id}` }, () => router.replace('/'))
      .subscribe();
    const t = setInterval(() => router.refresh(), 15000);
    return () => { clearInterval(t); s.removeChannel(ch); };
  }, [id, router]);
  return null;
}
