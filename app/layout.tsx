import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from './components/Navigation';
import ToastProvider from './components/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PR 2026 BJ - Plateforme de Vote',
  description: 'Plateforme de vote pour les élections PR 2026 au Bénin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" data-theme="dark">
      <body className={inter.className}>
        <Navigation />
        <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pt-20 sm:pt-24">{children}</main>
        <ToastProvider />
      </body>
    </html>
  );
}

