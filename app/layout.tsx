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
  metadataBase: new URL("https://obatra.vercel.app"),
  title: {
    default: "Obatra - AI Workspace for Your Business",
    template: "%s | Obatra",
  },
  description:
    "Obatra is an AI workspace for chat, writing, image generation, PDF analysis, and translation.",
  keywords: [
    "AI workspace",
    "AI tools",
    "AI chat",
    "AI writer",
    "AI image generator",
    "PDF AI",
    "AI translator",
    "Obatra",
  ],
  authors: [{ name: "Obatra" }],
  creator: "Obatra",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    url: "https://obatra.vercel.app",
    siteName: "Obatra",
    title: "Obatra - AI Workspace for Your Business",
    description:
      "Chat, write, create images, analyze PDFs, and translate with Obatra.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
