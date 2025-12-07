import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientBody from "./ClientBody";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aeroskop — Professional Storage Solutions",
  description: "Aeroskop provides cutting-edge surveillance storage solutions with AI-powered recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <Script 
          crossOrigin="anonymous" 
          src="//unpkg.com/same-runtime/dist/index.global.js"
          strategy="afterInteractive"
        />
        <link rel="preconnect" href="https://ext.same-assets.com" />
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' https://ext.same-assets.com https://unpkg.com data: blob:; img-src 'self' data: blob: https://*.digitaloceanspaces.com https://aeroskop-images-space-bucket.sgp1.digitaloceanspaces.com; connect-src 'self' http://localhost:* https://* ws: wss: http://unpkg.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com http://unpkg.com; script-src-elem 'self' 'unsafe-inline' https://unpkg.com http://unpkg.com; style-src 'self' 'unsafe-inline';" />
      </head>
      <body suppressHydrationWarning className="antialiased">
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
