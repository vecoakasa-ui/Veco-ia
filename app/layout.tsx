import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
  title: "Vision Immo 2.0 — La Plateforme SaaS de Gestion Immobilière en Afrique",
  description: "Vision Immo 2.0 est la plateforme SaaS n°1 spécialisée dans la gestion immobilière en Afrique. Nous vous accompagnons pour valoriser, protéger et rentabiliser vos biens. Suivez vos loyers, gérez vos locataires, générez vos quittances et encaissez via Mobile Money (Orange Money, MTN MoMo, Wave, Moov).",
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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
