import AuthForm from '@/components/AuthForm';
import LangToggle from '@/components/LangToggle';
import { getLocale } from '@/lib/locale';
import { dict } from '@/lib/dict';

export default function Login() {
  const l = getLocale();
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-5 p-6">
      <div className="flex items-center justify-between"><h1 className="text-xl font-semibold">{dict[l].app}</h1><LangToggle locale={l} /></div>
      <AuthForm d={dict[l]} />
    </main>
  );
}
