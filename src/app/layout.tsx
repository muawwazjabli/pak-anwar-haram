import './globals.css';
import type { Metadata } from 'next';
import { LanguageProvider } from '@/context/LanguageContext';

export const metadata: Metadata = {
  title: 'پاک انوار حرم | Pak Anwar Haram Travel & Tours',
  description: 'Verified Umrah packages, custom package calculator, wholesale-backed hotel and flight inventory for Pak Anwar Haram.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ur" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#faf8f5] text-gray-900 antialiased">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
