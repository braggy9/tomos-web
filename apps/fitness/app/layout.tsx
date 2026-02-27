import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { BottomNav } from "../components/BottomNav";
import { KeyboardShortcuts } from "../components/KeyboardShortcuts";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitnessOS",
  description: "Training dashboard for TomOS",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitnessOS",
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
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-dvh">
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')`,
          }}
        />
        <Providers>
          <KeyboardShortcuts />
          <main className="pb-20 lg:pb-0 lg:pl-56">
            <div className="mx-auto max-w-2xl lg:max-w-4xl px-4 py-4">
              {children}
            </div>
          </main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
