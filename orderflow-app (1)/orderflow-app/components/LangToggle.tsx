'use client';
import { useRouter } from 'next/navigation';
import { setLang } from '@/app/actions/lang';
export default function LangToggle({ locale }: { locale: 'fr' | 'ar' }) {
  const router = useRouter();
  const next = locale === 'ar' ? 'fr' : 'ar';
  return <button className="btn" onClick={async () => { await setLang(next); router.refresh(); }}>{next === 'ar' ? 'عربي' : 'Français'}</button>;
}
