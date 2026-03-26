import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Command Tower",
  description: "TomOS Command Tower Dashboard",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Command Tower",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f1117",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <body style={{ fontFamily: "var(--font-body)" }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`,
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
