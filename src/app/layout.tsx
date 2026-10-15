import { Inter, Geist_Mono, Syne } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MotionProvider } from "@/components/providers/motion-provider";
import { LanguageProvider } from "@/lib/language-context";
import { PrivacyManager } from "@/components/privacy/privacy-manager";
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
      <body
        className={`${inter.variable} ${geistMono.variable} ${syneDisplay.variable} antialiased`}
      >
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
                <PrivacyManager />
              </MotionProvider>
            </QueryProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
