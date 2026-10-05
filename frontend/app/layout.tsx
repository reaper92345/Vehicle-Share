import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EquipShare',
  description: 'Peer-to-peer heavy equipment rental marketplace',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
