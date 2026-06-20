import type { Metadata } from 'next';
import './globals.css';
import LoginPage from './page';
// import {Geist, Geist_Mono}  from '@next/font/google';

// const geistSans = Geist({ variables: '--font-geist-sans', subsets: ['latin'] });



// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

// export const metadata: Metadata = {
//   title: { default: 'Bessie', template: '%s | Next.js Playground' },
//   metadataBase: new URL('https://app-router.vercel.app'),
//   description:
//     'A playground to explore Next.js features such as nested layouts, instant loading states, streaming, and component level data fetching.',
//   openGraph: {
//     title: 'Bessie',
//     description:
//       'A playground to explore Next.js features such as nested layouts, instant loading states, streaming, and component level data fetching.',
//     images: [`/api/og?title=Next.js Playground`],
//   },
//   twitter: { card: 'summary_large_image' },
// };

export const metadata: Metadata = {
  title: 'ForBessie',
  description: 'Know everyting about your Bessie',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
