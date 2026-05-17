import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Rento — Rent Anything Nearby in Coimbatore',
    template: '%s | Rento',
  },
  description:
    'Rent cameras, drones, bikes, tools, event equipment, and more from trusted owners near you. Verified listings, secure payments, starting from ₹299/day.',
  keywords: [
    'rental marketplace India',
    'rent camera Coimbatore',
    'rent drone Coimbatore',
    'rent bike near me',
    'event equipment rental',
    'tools rental India',
    'Rento',
  ],
  authors: [{ name: 'Rento' }],
  creator: 'Rento',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://rento.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://rento.in',
    siteName: 'Rento',
    title: 'Rento — Rent Anything Nearby',
    description: 'Discover and rent anything nearby. Cameras, drones, bikes, tools, and more. Verified owners, secure ₹ payments.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Rento — Rent Anything Nearby',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rento — Rent Anything Nearby',
    description: 'Discover and rent anything nearby. Cameras, drones, bikes, tools, and more.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
