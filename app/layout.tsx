import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GESTIMMO CI — Gestion Immobilière en Côte d'Ivoire",
  description: "GESTIMMO CI est une SAS spécialisée dans la gestion immobilière en Côte d'Ivoire. Nous vous accompagnons pour valoriser, protéger et rentabiliser vos biens en toute confiance. Suivez vos loyers, gérez vos locataires, générez vos quittances et encaissez par cartes bancaires et paiements mobiles locaux (Orange Money, MTN MoMo, Wave, Moov).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
