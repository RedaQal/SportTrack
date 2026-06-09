import type { Metadata } from 'next';
import './globals.css';
import { ReduxProvider } from '@/components/ReduxProvider';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'SportTrack — Suivi Sportif & Santé',
  description: 'Plateforme de suivi de vos activités sportives et objectifs santé',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          <ReduxProvider>
            {children}
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
