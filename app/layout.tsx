import type { Metadata } from "next";
import { Inter, Noto_Sans_Sinhala, Playfair_Display } from "next/font/google";
import AmbientBackground from "@/components/visual/AmbientBackground";
import "./globals.css";

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
  title: "Likitha — Where Sri Lanka's stories live",
  description:
    "Discover, read, and share Sinhala stories and novels from Sri Lanka.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="si" className={`${inter.variable} ${sinhala.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AmbientBackground />
        {children}
      </body>
    </html>
  );
}
