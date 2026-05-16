import type { Metadata, Viewport } from 'next';
import { Orbitron, Rajdhani } from 'next/font/google';
import './globals.css';
import StackClientProvider from '@/components/ui/StackClientProvider';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
};

export const metadata: Metadata = {
  title: 'Shadow Fitness System',
  description: "Système d'entraînement Solo Leveling — Anne-Lise",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Shadow Fitness',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icons/favicon-32x32.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Shadow Fitness" />
      </head>
      <body className="bg-black text-white antialiased min-h-screen overflow-x-hidden">
        <StackClientProvider>
          {children}
        </StackClientProvider>
      </body>
    </html>
  );
}
