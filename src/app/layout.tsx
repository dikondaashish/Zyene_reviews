import { Inter, Geist_Mono, Syne } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { LanguageProvider } from "@/lib/language-context";
import { CookieBanner } from "@/components/ui/cookie-banner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import Script from "next/script";
import "./globals.css";

export { metadata, viewport } from "./layout-metadata";

/** Inline before paint ,  keeps `class="dark"` in sync with localStorage + system (next-themes). */
const themeInitScript = `(()=>{try{var t=localStorage.getItem('theme');var d=document.documentElement.classList;var dark=t==='dark'||(t!=='light'&&(!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);d.toggle('dark',!!dark);}catch(e){}})();`;

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], preload: false });
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
      <head>
        {/* Google Tag Manager */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WF6DJZ8J');`}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} ${syneDisplay.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WF6DJZ8J"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
        {/* dataLayer CTA click listener for GTM conversion tracking */}
        <Script id="cta-click-tracker" strategy="afterInteractive">
          {`document.addEventListener('click',function(e){var el=e.target.closest('[data-track]');if(!el)return;window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:el.getAttribute('data-track')+'_click',cta_location:el.getAttribute('data-track-location')||'',cta_text:(el.innerText||'').trim().slice(0,60),cta_url:el.getAttribute('href')||''});});`}
        </Script>
      </body>
    </html>
  );
}
