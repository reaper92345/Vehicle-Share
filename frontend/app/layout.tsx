import './globals.css';
import type { Metadata } from 'next';
import { NotificationProvider } from '../components/smoothui';

export const metadata: Metadata = {
  title: 'EquipShare - Nepal Heavy Equipment Marketplace',
  description: 'Peer-to-peer heavy machinery and construction equipment rental marketplace in Nepal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
