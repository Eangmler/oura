import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/ui/pwa-register";

export const metadata: Metadata = {
  title: "oura — intercity delivery",
  description: "Intercity parcel delivery between Accra and Kumasi via VIP Express with live hardware tracking.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "oura",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F0F0F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-body bg-paper text-ink min-h-screen">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
