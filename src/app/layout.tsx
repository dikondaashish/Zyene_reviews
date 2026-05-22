import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Syne } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/lib/language-context";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import "./globals.css";

/** Inline before paint — keeps `class="dark"` in sync with localStorage + system (next-themes). */
const themeInitScript = `(()=>{try{var t=localStorage.getItem('theme');var d=document.documentElement.classList;var dark=t==='dark'||(t!=='light'&&(!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);d.toggle('dark',!!dark);}catch(e){}})();`;

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

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "";

export const metadata: Metadata = {
  metadataBase: new URL("https://zyenereviews.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Zyene Reviews — Review Management for Local Businesses",
    template: "%s | Zyene Reviews",
  },
  description:
    "Monitor, respond to, and grow your Google reviews with AI. Zyene Reviews gives local businesses a full reputation management platform starting at $29.99/mo — with no annual contracts.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon_io/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/favicon_io/apple-touch-icon.png",
    shortcut: "/favicon_io/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zyene Reviews",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zyenereviews.com",
    siteName: "Zyene Reviews",
    title: "Zyene Reviews — Review Management for Local Businesses",
    description:
      "Monitor, respond to, and grow your Google reviews with AI. Full reputation management platform starting at $29.99/mo — no annual contracts.",
    images: [
      {
        url: "/og/og-default.png",
        width: 1200,
        height: 630,
        alt: "Zyene Reviews — Reputation Management for Local Businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zyene Reviews — Review Management for Local Businesses",
    description:
      "Monitor, respond to, and grow your Google reviews with AI. Starting at $29.99/mo — no annual contracts.",
    images: ["/og/og-default.png"],
    site: "@zyenereviews",
  },
  keywords: [
    "review management",
    "reputation management",
    "google reviews",
    "local business reviews",
    "AI review replies",
    "review requests",
    "competitor tracking",
    "local SEO",
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffefb" },
    { media: "(prefers-color-scheme: dark)", color: "#201515" },
  ],
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
        {META_PIXEL_ID ? (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        ) : null}
        {META_PIXEL_ID ? (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        ) : null}
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
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
              <CookieBanner />
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
