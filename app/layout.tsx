import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/layout/Navigation";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "StarEvents - Discover Amazing Events in Sri Lanka",
  description:
    "Book tickets for concerts, cultural shows, theatre performances and more across Sri Lanka. Your gateway to unforgettable experiences.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={false}
            >
              <AuthProvider>
                <CartProvider>
                  <div className="min-h-screen bg-gray-900 flex flex-col">
                    <Navigation />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                </CartProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
