import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'N2O Dashboard',
  description: 'Dashboard operativa N2O Srl — sicurezza sul lavoro',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
