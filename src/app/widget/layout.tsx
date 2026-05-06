import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Coach HelloSafe",
  description: "Vérifiez votre couverture voyage en 30 secondes",
  robots: { index: false, follow: false },
};

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased bg-transparent">{children}</body>
    </html>
  );
}
