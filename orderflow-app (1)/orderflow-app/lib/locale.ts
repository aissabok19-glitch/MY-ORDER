import { cookies } from 'next/headers';
import { dict, type Locale } from './dict';
export const getLocale = (): Locale => (cookies().get('lang')?.value === 'ar' ? 'ar' : 'fr');
export const getDict = () => dict[getLocale()];
