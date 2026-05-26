import type { Metadata } from 'next';
import './globals.css';
import { ReduxProvider } from '@/components/ReduxProvider';

export const metadata: Metadata = {
  title: 'SportTrack — Suivi Sportif & Santé',
  description: 'Plateforme de suivi de vos activités sportives et objectifs santé',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
