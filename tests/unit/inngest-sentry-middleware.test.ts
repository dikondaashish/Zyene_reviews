import { beforeEach, describe, expect, it, vi } from "vitest";

const captureException = vi.fn();
const withScope = vi.fn(
    (
        callback: (scope: {
            setTag: ReturnType<typeof vi.fn>;
            setExtra: ReturnType<typeof vi.fn>;
        }) => void
    ) => {
        const scope = { setTag: vi.fn(), setExtra: vi.fn() };
        callback(scope);
        return scope;
    }
);

vi.mock("@sentry/nextjs", () => ({
    withScope,
    captureException,
}));

type MiddlewareInit = (args: {
    client: never;
    fn?: never;
}) => Promise<{
    onFunctionRun?: (args: {
        ctx: { event: { name: string; data: Record<string, unknown> }; runId: string };
        fn: { name: string };
        steps: unknown[];
        reqArgs: unknown[];
    }) => Promise<{
        finished?: (args: { result: { error?: unknown; data?: unknown } }) => Promise<void> | void;
    }>;
}>;

describe("inngestSentryMiddleware", () => {
    beforeEach(() => {
        captureException.mockClear();
        withScope.mockClear();
    });

    it("captures finished function errors with Inngest and tenant tags", async () => {
        const { inngestSentryMiddleware } = await import("@/services/inngest/sentry-middleware");
        const init = inngestSentryMiddleware.init as unknown as MiddlewareInit;

        const hooks = await init({
            client: {} as never,
            fn: undefined,
        });

        const runHooks = await hooks.onFunctionRun?.({
            ctx: {
                event: {
                    name: "review/sync.platform",
                    data: { businessId: "biz_1", platformId: "plat_1" },
                },
                runId: "run_1",
            },
            fn: { name: "sync-platform-worker" },
            steps: [],
            reqArgs: [],
        });

        const error = new Error("Google sync blew up");
        await runHooks?.finished?.({ result: { error, data: undefined } });

        expect(withScope).toHaveBeenCalledOnce();
        expect(captureException).toHaveBeenCalledWith(error);

        const scope = withScope.mock.results[0]?.value as {
            setTag: ReturnType<typeof vi.fn>;
        };
        expect(scope.setTag).toHaveBeenCalledWith("inngest", "true");
        expect(scope.setTag).toHaveBeenCalledWith("inngest_function", "sync-platform-worker");
        expect(scope.setTag).toHaveBeenCalledWith("business_id", "biz_1");
        expect(scope.setTag).toHaveBeenCalledWith("platform_id", "plat_1");
    });

    it("ignores successful finished runs", async () => {
        const { inngestSentryMiddleware } = await import("@/services/inngest/sentry-middleware");
        const init = inngestSentryMiddleware.init as unknown as MiddlewareInit;

        const hooks = await init({
            client: {} as never,
            fn: undefined,
        });

        const runHooks = await hooks.onFunctionRun?.({
            ctx: {
                event: { name: "cron/weekly-digest.business", data: {} },
                runId: "run_ok",
            },
            fn: { name: "weekly-digest" },
            steps: [],
            reqArgs: [],
        });

        await runHooks?.finished?.({ result: { error: undefined, data: { ok: true } } });
        expect(captureException).not.toHaveBeenCalled();
    });
});
