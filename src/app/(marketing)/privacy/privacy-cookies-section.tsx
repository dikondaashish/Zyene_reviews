import { ManageCookiesButton } from "@/components/consent/manage-cookies-button";

/** Keep in sync with what `ConsentScripts` and the root layout actually load. */
const COOKIE_TOOLS: { tool: string; purpose: string; category: string }[] = [
    { tool: "Supabase (sb-* cookies)", purpose: "Keeps you signed in across app and auth subdomains", category: "Strictly necessary" },
    { tool: "OAuth state cookies", purpose: "Protect Google and Facebook connection flows against forgery", category: "Strictly necessary" },
    { tool: "zyene_consent", purpose: "Remembers your cookie choice for six months on all our subdomains", category: "Strictly necessary" },
    { tool: "locale, theme, sidebar state", purpose: "Remember language, light/dark mode and layout you picked", category: "Strictly necessary" },
    { tool: "Google Sign-In, Stripe Checkout, Cal.com", purpose: "Load only when you sign in with Google, pay, or book a demo", category: "Strictly necessary (requested by you)" },
    { tool: "Sentry error monitoring", purpose: "Reports crashes so we can fix them; sets no cookies", category: "Strictly necessary" },
    { tool: "Vercel Analytics & Speed Insights", purpose: "Aggregate page and performance stats; cookie-free, no cross-site tracking", category: "Cookie-free measurement" },
    { tool: "Google Analytics via Google Tag Manager", purpose: "Which pages are visited and how people find us (_ga cookies)", category: "Analytics (opt-in)" },
    { tool: "Sentry Session Replay", purpose: "Masked replays of sessions that hit an error", category: "Analytics (opt-in)" },
    { tool: "Meta Pixel, Google Ads tags", purpose: "Measure which ads lead to sign-ups (_fbp, _gcl cookies)", category: "Marketing (opt-in)" },
    { tool: "zyene_utm", purpose: "Remembers the campaign that brought you, for 30 days", category: "Marketing (opt-in)" },
];

export function PrivacyCookiesSection() {
    return (
        <>
            <h2 id="cookies" className="text-2xl font-semibold mt-10 mb-4 scroll-mt-24">
                5. Cookies &amp; Tracking Technologies
            </h2>
            <p>
                Strictly necessary cookies run without asking because the Services cannot work without them. Analytics
                and marketing tools load only after you opt in through our cookie banner, and nothing is shared for
                advertising until you do. Your choice is stored once and applies to zyenereviews.com,
                auth.zyenereviews.com and app.zyenereviews.com.
            </p>
            <div className="not-prose my-6 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[560px] text-left text-sm">
                    <thead className="bg-muted/50 text-foreground">
                        <tr>
                            <th className="px-3 py-2 font-semibold">Tool</th>
                            <th className="px-3 py-2 font-semibold">Purpose</th>
                            <th className="px-3 py-2 font-semibold">Category</th>
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
                <ManageCookiesButton className="text-primary underline underline-offset-2" />, available in the footer
                of every page. We honour the Global Privacy Control signal as an opt-out of marketing cookies and of
                any &ldquo;sharing&rdquo; of personal information for cross-context behavioral advertising under
                California law.
            </p>
        </>
    );
}
