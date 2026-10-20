import type { Metadata } from 'next';
import './globals.css';

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
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="bg-midnight-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
