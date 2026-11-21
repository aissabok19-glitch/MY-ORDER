'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import type { Dict } from '@/lib/dict';

export default function AuthForm({ d }: { d: Dict }) {
  const router = useRouter();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg('');
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email')), password = String(f.get('password')), s = supabaseBrowser();
    const res = mode === 'in'
      ? await s.auth.signInWithPassword({ email, password })
      : await s.auth.signUp({ email, password, options: { data: { full_name: String(f.get('name') ?? '') } } });
    setBusy(false);
    if (res.error) { setMsg(res.error.message); return; }
    if (mode === 'up' && !res.data.session) { setMsg(d.checkMail); return; }      // email confirmation enabled
    router.replace('/'); router.refresh();                                        // middleware sends inactive users to /pending
  }

  return (
    <form onSubmit={submit} className="card flex flex-col gap-3">
      <h2 className="font-medium">{mode === 'in' ? d.login : d.signup}</h2>
      {mode === 'up' && <input name="name" className="input" placeholder={d.fullName} autoComplete="name" required />}
      <input name="email" type="email" className="input" placeholder={d.email} autoComplete="email" required dir="ltr" />
      <input name="password" type="password" className="input" placeholder={d.password} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} minLength={8} required dir="ltr" />
      {msg && <p role="alert" className="text-sm text-red-600">{msg}</p>}
      <button className="btn btn-primary" disabled={busy}>{mode === 'in' ? d.login : d.signup}</button>
      <button type="button" className="text-sm text-blue-600 underline" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setMsg(''); }}>
        {mode === 'in' ? d.noAccount : d.haveAccount}
      </button>
    </form>
  );
}
