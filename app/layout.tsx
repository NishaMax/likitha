import type { Metadata } from "next";
import { Inter, Noto_Sans_Sinhala, Playfair_Display } from "next/font/google";
import AmbientBackground from "@/components/visual/AmbientBackground";
import SiteFooter from "@/components/navigation/SiteFooter";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://likitha.lk";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sinhala = Noto_Sans_Sinhala({
  variable: "--font-sinhala",
  subsets: ["sinhala"],
  weight: ["400", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Likitha — Where Sri Lanka's stories live",
    template: "%s | Likitha",
  },
  description:
    "Discover, read, and share Sinhala stories and novels from Sri Lanka.",
  applicationName: "Likitha",
  keywords: ["Sinhala stories", "Sri Lankan writers", "Sinhala novels", "Sinhala poetry", "Likitha"],
  authors: [{ name: "Likitha" }],
  creator: "Likitha",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "si_LK",
    url: siteUrl,
    siteName: "Likitha",
    title: "Likitha — Where Sri Lanka's stories live",
    description: "Discover, read, and share Sinhala stories and novels from Sri Lanka.",
  },
  twitter: {
    card: "summary",
    title: "Likitha — Where Sri Lanka's stories live",
    description: "Discover, read, and share Sinhala stories and novels from Sri Lanka.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="si" className={`${inter.variable} ${sinhala.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AmbientBackground />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
