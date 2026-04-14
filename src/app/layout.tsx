import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Syne } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/lib/language-context";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Display / marketing hero face — geometric, Degular-like; UI stays Inter per docs/DESIGN.md */
const syneDisplay = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Zyene Reviews - Reputation Management for Local Businesses",
  description: "Automate your customer reviews and grow your business with Zyene Reviews.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zyene Reviews",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff4f00",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} ${syneDisplay.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <QueryProvider>
              {children}
              <Toaster />
              <Analytics />
              <SpeedInsights />
            </QueryProvider>
          </LanguageProvider>
        </ThemeProvider>
        <Script
          src="https://uptime.betterstack.com/widgets/announcement.js"
          data-id="239670"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
