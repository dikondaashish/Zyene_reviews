import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ open: false, setOpen: vi.fn(), history: vi.fn(), root: vi.fn() }));
vi.mock("react", async importOriginal => ({
    ...await importOriginal<typeof import("react")>(), useState: () => [mocks.open, mocks.setOpen],
}));
vi.mock("@/components/ui/dialog", () => ({
    Dialog: (props: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => {
        mocks.root(props);
        return createElement("div", null, props.children);
    },
    DialogTrigger: ({ children }: { children: React.ReactNode }) => children,
    DialogContent: ({ children }: { children: React.ReactNode }) => mocks.open ? createElement("div", { role: "dialog" }, children) : null,
    DialogHeader: ({ children }: { children: React.ReactNode }) => createElement("header", null, children),
    DialogTitle: ({ children }: { children: React.ReactNode }) => createElement("h2", null, children),
    DialogDescription: ({ children }: { children: React.ReactNode }) => createElement("p", null, children),
}));
vi.mock("@/components/settings/billing-invoice-history", () => ({
    BillingInvoiceHistory: (props: object) => { mocks.history(props); return createElement("div", null, "Invoice history"); },
}));
import { BillingInvoicesDialog } from "@/components/settings/billing-invoices-dialog";
const render = (canManageBilling = true) => renderToStaticMarkup(createElement(BillingInvoicesDialog, {
    organizationId: "org-active", canManageBilling, hasStripeCustomer: true,
}));

describe("invoice history popup", () => {
    beforeEach(() => { vi.clearAllMocks(); mocks.open = false; });

    it("offers the Invoices button without mounting or fetching history before it is opened", () => {
        const html = render();
        expect(html).toContain("Invoices");
        expect(html).not.toContain('role="dialog"');
        expect(mocks.history).not.toHaveBeenCalled();
    });

    it("shows history for the selected organization inside an accessible dialog", () => {
        mocks.open = true;
        const html = render();
        expect(html).toContain('role="dialog"');
        expect(html).toContain("download invoice PDFs");
        expect(mocks.history).toHaveBeenCalledWith({
            organizationId: "org-active", canManageBilling: true, hasStripeCustomer: true,
        });
    });

    it("uses the dialog open/close state and unmounts history when closed", () => {
        mocks.open = true;
        render();
        mocks.root.mock.calls.at(-1)?.[0].onOpenChange(false);
        expect(mocks.setOpen).toHaveBeenCalledWith(false);
        mocks.open = false;
        mocks.history.mockClear();
        render();
        expect(mocks.history).not.toHaveBeenCalled();
    });

    it("does not offer private invoice history without billing permission", () => {
        expect(render(false)).toBe("");
        expect(mocks.history).not.toHaveBeenCalled();
    });
});
