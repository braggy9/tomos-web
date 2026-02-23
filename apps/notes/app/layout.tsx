import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import { BottomNav } from "../components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "TomOS Notes",
  description: "Professional notes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Notes",
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
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-dvh">
        <Providers>
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
