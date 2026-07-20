import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

import AnnouncementBanner from "../components/AnnouncementBanner";

export const metadata: Metadata = {
  metadataBase: new URL('https://veco-ia.vercel.app'),
  title: "Vision Immo 2.0 — La Plateforme SaaS de Gestion Immobilière en Afrique",
  description: "Vision Immo 2.0 est la plateforme SaaS n°1 spécialisée dans la gestion immobilière en Afrique. Nous vous accompagnons pour valoriser, protéger et rentabiliser vos biens. Suivez vos loyers, gérez vos locataires, générez vos quittances et encaissez via Mobile Money (Orange Money, MTN MoMo, Wave, Moov).",
  openGraph: {
    title: "Vision Immo 2.0 — Logiciel de Gestion Immobilière",
    description: "La plateforme SaaS n°1 spécialisée dans la gestion immobilière en Afrique. Suivez vos loyers et encaissez via Mobile Money.",
    url: 'https://veco-ia.vercel.app',
    siteName: 'Vision Immo 2.0',
    images: [
      {
        url: '/gestimmo_hero_bg.png',
        width: 1200,
        height: 630,
        alt: 'Vision Immo 2.0 Dashboard',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Vision Immo 2.0 — Logiciel de Gestion Immobilière",
    description: "La plateforme SaaS n°1 en Afrique pour rentabiliser vos biens.",
    images: ['/gestimmo_hero_bg.png'],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Vision Immo 2.0",
  "operatingSystem": "Web",
  "applicationCategory": "BusinessApplication",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "124"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "XOF"
  },
  "description": "Logiciel SaaS de gestion immobilière en Côte d'Ivoire et en Afrique. Automatisez vos quittances, gérez vos locataires et encaissez les loyers par Mobile Money."
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#111827' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1412249487384943');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1412249487384943&ev=PageView&noscript=1" alt="" />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider>
          <AnnouncementBanner />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
