import { Inter, Geist_Mono, Syne } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { LanguageProvider } from "@/lib/language-context";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConditionalWebSiteJsonLd } from "@/components/seo/conditional-website-json-ld";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import Script from "next/script";
import "./globals.css";

export { metadata, viewport } from "./layout-metadata";

/** Inline before paint ,  keeps `class="dark"` in sync with localStorage + system (next-themes). */
const themeInitScript = `(()=>{try{var t=localStorage.getItem('theme');var d=document.documentElement.classList;var dark=t==='dark'||(t!=='light'&&(!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);d.toggle('dark',!!dark);}catch(e){}})();`;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Display / marketing hero face ,  geometric, Degular-like; UI stays Inter per docs/DESIGN.md */
const syneDisplay = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

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
        <MetaPixel />
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
              <MotionProvider>
                <ConditionalWebSiteJsonLd />
                {children}
                <Toaster />
                <CookieBanner />
                <Analytics />
                <SpeedInsights />
              </MotionProvider>
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
