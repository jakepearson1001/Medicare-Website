import type { Metadata } from 'next';
import { Archivo_Black, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import InventoryDrawer from '@/components/InventoryDrawer';
import KonamiListener from '@/components/KonamiListener';
import RareEventRoller from '@/components/RareEventRoller';
import ExitIntentDialogue from '@/components/ExitIntentDialogue';
import WalkingCat from '@/components/WalkingCat';

const archivoBlack = Archivo_Black({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://npcoutfitters.example.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NPC Outfitters — Default Skins for Real Life',
    template: '%s | NPC Outfitters',
  },
  description:
    'NPC Outfitters. Default skins for real life. Free shipping on orders over $50, allegedly. (Actually yes.)',
  openGraph: {
    title: 'NPC Outfitters — Default Skins for Real Life',
    description: 'Everyone dresses like a background character. So we made the uniform.',
    url: SITE_URL,
    siteName: 'NPC Outfitters',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NPC Outfitters — Default Skins for Real Life',
    description: 'Everyone dresses like a background character. So we made the uniform.',
  },
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivoBlack.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body bg-cream text-ink">
        {/* TODO: GA4 — add gtag.js script here or via next/script once
            NEXT_PUBLIC_GA_MEASUREMENT_ID is set. See .env.example. */}
        {/* TODO: Meta Pixel — add pixel base code here once
            NEXT_PUBLIC_META_PIXEL_ID is set. See .env.example. */}
        <AnnouncementBar />
        <Header />
        <main>{children}</main>
        <Footer />
        <InventoryDrawer />
        <KonamiListener />
        <RareEventRoller />
        <ExitIntentDialogue />
        <WalkingCat />
      </body>
    </html>
  );
}
