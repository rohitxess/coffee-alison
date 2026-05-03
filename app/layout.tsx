import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Coffee Alison',
  description: 'Do you want coffee?',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
