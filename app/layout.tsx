import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import SwRegister from '@/components/SwRegister';
import { getLocale } from '@/lib/locale';
import { dict } from '@/lib/dict';

export const metadata: Metadata = {
  title: 'OrderFlow', applicationName: 'OrderFlow',
  appleWebApp: { capable: true, title: 'OrderFlow', statusBarStyle: 'default' },
  icons: { icon: '/icons/icon-192.png', apple: '/apple-touch-icon.png' },
};
export const viewport: Viewport = { themeColor: '#2563eb', width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: ReactNode }) {
  const l = getLocale();
  return (
    <html lang={l} dir={l === 'ar' ? 'rtl' : 'ltr'}>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-100">
        {children}
        <SwRegister label={dict[l].install} />
      </body>
    </html>
  );
}
