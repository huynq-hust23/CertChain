import NavBar from "@/components/NavBar";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import { PhantomWalletProvider } from "@/lib/phantom-wallet";
import type { Metadata } from "next";
import type { Viewport } from "next";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};
export const metadata: Metadata = {
  applicationName: "CertChain",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  title: "CertChain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <PhantomWalletProvider>
          <div className="flex flex-col min-h-screen min-w-full bg-background max-h-screen">
            <NavBar />
            <main className="flex w-full flex-grow h-full items-center justify-center">
              {children}
            </main>
            <Toaster />
          </div>
        </PhantomWalletProvider>
      </body>
    </html>
  );
}
