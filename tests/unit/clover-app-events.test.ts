import { describe, expect, it } from "vitest";
import { cloverAppEventAction } from "@/services/clover/app-event-action";
import {
    parseCloverAppEvents,
    parseCloverPaymentEvents,
} from "@/services/clover/webhook-parse";

describe("parseCloverAppEvents", () => {
    it("extracts A: app events and ignores payments", () => {
        const events = parseCloverAppEvents({
            appId: "APP1",
            merchants: {
                M1: [
                    { objectId: "A:APP1", type: "DELETE", ts: 10 },
                    { objectId: "P:PAY1", type: "CREATE", ts: 11 },
                    { objectId: "A:APP1", type: "CREATE", ts: 12 },
                ],
            },
        });
        expect(events).toEqual([
            { merchantId: "M1", appObjectId: "APP1", eventType: "DELETE", ts: 10 },
            { merchantId: "M1", appObjectId: "APP1", eventType: "CREATE", ts: 12 },
        ]);
        expect(parseCloverPaymentEvents({
            merchants: {
                M1: [
                    { objectId: "A:APP1", type: "DELETE", ts: 10 },
                    { objectId: "P:PAY1", type: "CREATE", ts: 11 },
                ],
            },
        })).toHaveLength(1);
    });
});

describe("cloverAppEventAction", () => {
    it("marks disconnect on uninstall DELETE", () => {
        expect(cloverAppEventAction("DELETE")).toBe("mark_disconnected");
    });

    it("clears disconnect on install CREATE (OAuth still owns tokens)", () => {
        expect(cloverAppEventAction("CREATE")).toBe("clear_disconnect");
    });

    it("logs subscription UPDATE only", () => {
        expect(cloverAppEventAction("UPDATE")).toBe("log_only");
    });
});
