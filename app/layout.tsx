import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VENANCE IMO.CI — Gestion Immobilière en Côte d'Ivoire",
  description: "VENANCE IMO.CI est spécialisée dans la gestion immobilière en Côte d'Ivoire. Nous vous accompagnons pour valoriser, protéger et rentabiliser vos biens en toute confiance. Suivez vos loyers, gérez vos locataires, générez vos quittances et encaissez par cartes bancaires et paiements mobiles locaux (Orange Money, MTN MoMo, Wave, Moov).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
