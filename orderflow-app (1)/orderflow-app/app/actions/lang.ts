'use server';
import { cookies } from 'next/headers';
export async function setLang(l: string) { cookies().set('lang', l === 'ar' ? 'ar' : 'fr', { path: '/', maxAge: 31536000, sameSite: 'lax' }); }
