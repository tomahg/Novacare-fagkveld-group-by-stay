import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GroupByStay | Novacare",
  description: "Påmelding og gruppeinndeling for arrangement",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="no">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
