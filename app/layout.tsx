import "./css/style.css";

import { Inter, Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://neve-rando.fr"),
  title: {
    default: "Névé - S'évader en randonnée sans voiture",
    template: "%s | Névé",
  },
  description: "L'application mobile pour s'évader en randonnée sans voiture et l'esprit tranquille.",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-placeholder",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body
        className={`${inter.variable} ${bricolage.variable} bg-gray-50 font-bricolage tracking-tight text-gray-900 antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-04VG4TQB49"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-04VG4TQB49');
          `}
        </Script>
        <div className="flex min-h-screen flex-col overflow-x-clip">
          {children}
        </div>
      </body>
    </html>
  );
}

