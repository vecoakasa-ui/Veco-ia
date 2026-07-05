import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

import AnnouncementBanner from "../components/AnnouncementBanner";

export const metadata: Metadata = {
  title: "Vision Immo 2.0 — La Plateforme SaaS de Gestion Immobilière en Afrique",
  description: "Vision Immo 2.0 est la plateforme SaaS n°1 spécialisée dans la gestion immobilière en Afrique. Nous vous accompagnons pour valoriser, protéger et rentabiliser vos biens. Suivez vos loyers, gérez vos locataires, générez vos quittances et encaissez via Mobile Money (Orange Money, MTN MoMo, Wave, Moov).",
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
        <ThemeProvider>
          <AnnouncementBanner />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
