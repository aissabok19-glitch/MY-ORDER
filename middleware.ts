import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PUBLIC = ['/login', '/offline', '/manifest.webmanifest', '/sw.js'];

export async function middleware(req: NextRequest) {
  const { res, supabase, user } = await updateSession(req);
  const path = req.nextUrl.pathname;
  const go = (to: string) => { const u = req.nextUrl.clone(); u.pathname = to; u.search = ''; return NextResponse.redirect(u); };

  if (PUBLIC.includes(path)) return user && path === '/login' ? go('/') : res;
  if (!user) return go('/login');

  const { data: prof } = await supabase.from('profiles').select('role,is_active').eq('id', user.id).single();
  if (!prof?.is_active) return path === '/pending' ? res : go('/pending');       // pending activation
  if (path === '/pending') return go('/');
  if (path.startsWith('/admin') && prof.role !== 'admin') return go('/');        // admin-only area
  return res;
}
export const config = { matcher: ['/((?!_next/static|_next/image|icons/|apple-touch-icon.png|favicon.ico).*)'] };
