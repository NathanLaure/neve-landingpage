import "./css/style.css";

import { Inter, Bricolage_Grotesque } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";

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
  /* Avec le `www` : c'est l'hôte canonique, l'apex répond 308 vers lui. Sans
     lui, chaque page annonçait un canonique qui redirige — un signal qui se
     contredit lui-même. */
  metadataBase: new URL("https://www.neve-rando.fr"),
  title: {
    default: "Névé - S'évader en randonnée sans voiture",
    template: "%s | Névé",
  },
  description: "L'application mobile pour s'évader en randonnée sans voiture et l'esprit tranquille.",
  icons: {
    icon: [
      { url: "/icon-dark.svg", media: "(prefers-color-scheme: dark)", type: "image/svg+xml" },
      { url: "/icon-light.svg", media: "(prefers-color-scheme: light)", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
      <head>
        <link rel="icon" href="/icon-dark.svg" media="(prefers-color-scheme: dark)" type="image/svg+xml" />
        <link rel="icon" href="/icon-light.svg" media="(prefers-color-scheme: light)" type="image/svg+xml" />
      </head>
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
        <AuthProvider>
          <FavoritesProvider>
            <div className="flex min-h-screen flex-col overflow-x-clip">
              {children}
            </div>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

