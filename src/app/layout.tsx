import type { Metadata } from 'next';
import './globals.css';
import { Fraunces, DM_Sans } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'THE LAST LIGHT: The Invisible Resident',
  description:
    'An inclusive urban design puzzle game built for Girls Who Code HHS Hackathon 2026. A city isn’t truly connected until everyone can find their way home.',
  keywords: ['game', 'accessibility', 'universal design', 'social impact', 'girls who code', 'puzzle'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased selection:bg-coral selection:text-ivory" style={{ background: '#1A2830', color: '#F6F3EB' }}>
        {children}
      </body>
    </html>
  );
}
