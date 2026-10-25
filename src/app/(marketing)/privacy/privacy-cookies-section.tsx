import { PrivacyChoicesButton } from "@/components/privacy/privacy-choices-button";

/**
 * Public cookie list. Keep in sync with `PrivacyScripts`, `tracking-config.ts`
 * and docs/PRIVACY.md (the developer inventory). Wording changes here need
 * legal review; do not add compliance claims.
 */
const COOKIE_TOOLS: { tool: string; purpose: string; category: string }[] = [
    { tool: "Supabase sign-in cookies (sb-*)", purpose: "Keep you signed in across app and auth subdomains", category: "Essential" },
    { tool: "Sign-in and connection state cookies", purpose: "Protect Google and Facebook connection flows against forgery", category: "Essential" },
    { tool: "zyene_consent", purpose: "Remembers your privacy choices for six months on all our subdomains", category: "Essential" },
    { tool: "zyene_jurisdiction", purpose: "Region group (EU/EEA, UK, US or other) used to pick the right privacy defaults; no country or location detail", category: "Essential" },
    { tool: "locale, theme, sidebar and dismissed-tip settings", purpose: "Remember language, light/dark mode, layout and messages you closed", category: "Essential" },
    { tool: "Google Sign-In, Stripe Checkout", purpose: "Load only when you sign in with Google or pay", category: "Essential (requested by you)" },
    { tool: "Sentry error monitoring", purpose: "Reports crashes so we can fix them; sets no cookies", category: "Essential" },
    { tool: "Vercel Web Analytics & Speed Insights", purpose: "Aggregate page and performance stats; no cookies or device storage. Turned off if you reject analytics", category: "Cookie-free measurement" },
    { tool: "Cal.com booking calendar", purpose: "Embedded demo scheduling; sets Cal.com's own cookies", category: "Functional" },
    { tool: "Better Stack status notices", purpose: "Shows service-incident announcements", category: "Functional" },
    { tool: "Google Analytics via Google Tag Manager", purpose: "Which pages are visited and how people find us (_ga cookies)", category: "Analytics" },
    { tool: "Sentry Session Replay", purpose: "Masked recordings of a sample of sessions and of sessions that hit an error", category: "Analytics" },
    { tool: "Zyene usage events", purpose: "Our own page and sign-up step counts", category: "Analytics" },
    { tool: "Meta Pixel, server-side Meta conversion events and Google Ads tags", purpose: "Measure which ads lead to trial starts and first paid subscriptions (_fbp, _fbc, _gcl cookies)", category: "Marketing" },
    { tool: "zyene_utm", purpose: "Remembers the campaign that brought you, for 30 days", category: "Marketing" },
];

export function PrivacyCookiesSection() {
    return (
        <>
            <h2 id="cookies" className="text-2xl font-semibold mt-10 mb-4 scroll-mt-24">
                5. Cookies &amp; Tracking Technologies
            </h2>
            <p>
                Essential cookies always run because the Services cannot work without them. How optional cookies
                (functional, analytics and marketing) behave depends on the region we estimate from your connection:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                    <strong>EU/EEA, UK and all other regions:</strong> optional cookies stay off, and their scripts do
                    not load, until you choose to allow them in our cookie banner.
                </li>
                <li>
                    <strong>United States:</strong> optional cookies are on by default and you can turn any category
                    off at any time.
                </li>
            </ul>
            <p>
                Your choice is stored once and applies to zyenereviews.com, auth.zyenereviews.com and
                app.zyenereviews.com. We only use your approximate country to pick one of these region groups; we do
                not store it.
            </p>
            <div className="not-prose my-6 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-muted/50 text-foreground">
                        <tr>
                            <th scope="col" className="px-3 py-2 font-semibold">Tool</th>
                            <th scope="col" className="px-3 py-2 font-semibold">Purpose</th>
                            <th scope="col" className="px-3 py-2 font-semibold">Category</th>
                        </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                        {COOKIE_TOOLS.map((row) => (
                            <tr key={row.tool} className="border-t border-border">
                                <td className="px-3 py-2 text-foreground">{row.tool}</td>
                                <td className="px-3 py-2">{row.purpose}</td>
                                <td className="px-3 py-2">{row.category}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p>
                You can change or withdraw your choice at any time with{" "}
                <PrivacyChoicesButton className="text-primary underline underline-offset-2" />, available in the footer
                of every page. If your browser sends a Global Privacy Control signal, we treat it as a request to opt
                out of marketing cookies and of any &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information
                for cross-context behavioral advertising. It does not switch off essential cookies.
            </p>
        </>
    );
}
