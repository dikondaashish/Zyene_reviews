const SALES_TO = "sales@zyenereviews.com";
const SALES_CC = "Karthik.reddy@zyene.com";
const SUBJECT = "Interested in Zyene Enterprise Plan";
const BODY = `Hi Zyene Reviews,

We are interested to talk with you regarding a bigger plan.`;

/**
 * Opens Gmail’s “compose” screen in the browser (logged-in account).
 * `mailto:` only triggers the OS default mail app, which is often not Gmail.
 */
export function enterpriseSalesGmailComposeUrl(): string {
    const u = new URL("https://mail.google.com/mail/");
    u.searchParams.set("view", "cm");
    u.searchParams.set("fs", "1");
    u.searchParams.set("to", SALES_TO);
    u.searchParams.set("cc", SALES_CC);
    u.searchParams.set("su", SUBJECT);
    u.searchParams.set("body", BODY);
    return u.toString();
}
