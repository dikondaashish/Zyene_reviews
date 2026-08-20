import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("dashboard header switchers", () => {
    it("does not render Organization/Business labels above the switchers", () => {
        const header = fs.readFileSync(
            path.join(root, "src/components/dashboard/dashboard-header-controls.tsx"),
            "utf8",
        );
        expect(header).not.toContain(">Organization<");
        expect(header).not.toContain(">Business<");
    });

    it("does not repeat Organization/Business titles inside the dropdown menus", () => {
        const orgSwitcher = fs.readFileSync(
            path.join(root, "src/components/dashboard/organization-switcher.tsx"),
            "utf8",
        );
        const businessSwitcher = fs.readFileSync(
            path.join(root, "src/components/dashboard/business-switcher.tsx"),
            "utf8",
        );
        expect(orgSwitcher).not.toContain("DropdownMenuLabel");
        expect(businessSwitcher).not.toContain("DropdownMenuLabel");
    });
});
