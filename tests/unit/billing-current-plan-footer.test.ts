import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { getDictionary } from "@/lib/i18n/dictionaries";
vi.mock("@/components/settings/billing-invoices-dialog", () => ({
    BillingInvoicesDialog: ({ canManageBilling }: { canManageBilling: boolean }) =>
        canManageBilling ? createElement("button", null, "Invoices") : null,
}));
import { BillingCurrentPlanFooter } from "@/components/settings/billing-current-plan-footer";
const render = (hasStripeCustomer = true, canManageBilling = true) => renderToStaticMarkup(createElement(BillingCurrentPlanFooter, {
    billing: getDictionary().billing, organizationId: "org-active", hasStripeCustomer, canManageBilling,
    loadingPortal: false, onManageSubscription: vi.fn(), permissionTooltip: canManageBilling ? undefined : "Owner only",
}));

describe("current plan billing actions", () => {
    it("places Invoices immediately before Billing portal", () => {
        const html = render();
        expect(html).toContain("Invoices");
        expect(html).toContain("Billing portal");
        expect(html.indexOf("Invoices")).toBeLessThan(html.indexOf("Billing portal"));
    });
    it("omits billing actions when no Stripe customer exists", () => expect(render(false)).toBe(""));
    it("retains billing permission restrictions", () => {
        const html = render(true, false);
        expect(html).not.toContain("Invoices");
        expect(html).toContain('disabled=""');
    });
});
