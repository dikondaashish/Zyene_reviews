import { Agent, fetch as undiciFetch } from "undici";
import { checkOriginIsPublic, resolvePublicAddress } from "@/services/aeo/crawler/ssrf-guard";

type PublicHttpOptions = {
    method?: "GET" | "POST" | "HEAD";
    headers?: Record<string, string>;
    body?: string;
    timeoutMs?: number;
    maxBytes?: number;
    redirect?: "error" | "manual";
};

export type PublicHttpResult = {
    ok: boolean;
    status: number;
    text: string;
    location: string | null;
};

type PublicHttpBytesResult = Omit<PublicHttpResult, "text"> & {
    bytes: Uint8Array;
    contentType: string | null;
};

async function readBytesCapped(
    response: Awaited<ReturnType<typeof undiciFetch>>,
    maxBytes: number,
): Promise<Uint8Array> {
    if (!response.body) return new Uint8Array();
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            const remaining = Math.max(0, maxBytes - total);
            chunks.push(value.subarray(0, remaining));
            total += value.byteLength;
            if (total > maxBytes) break;
        }
        return Buffer.concat(chunks);
    } finally {
        await reader.cancel().catch(() => undefined);
    }
}

/** The connection's DNS lookup rechecks every address, closing preflight TOCTOU. */
export async function fetchPublicHttpBytes(
    url: string,
    options: PublicHttpOptions = {},
): Promise<PublicHttpBytesResult> {
    const safety = await checkOriginIsPublic(url);
    if (!safety.safe) throw new Error(safety.reason);

    const agent = new Agent({
        connect: {
            // Pin one vetted address; Node's automatic family selection expects
            // an array from lookup(), whereas this lookup returns one address.
            autoSelectFamily: false,
            lookup(hostname, _lookupOptions, callback) {
                void resolvePublicAddress(hostname).then(
                    ({ address, family }) => callback(null, address, family),
                    (error: unknown) => callback(error as Error, "", 4),
                );
            },
        },
    });
    try {
        const response = await undiciFetch(url, {
            method: options.method ?? "GET",
            headers: options.headers,
            body: options.body,
            redirect: options.redirect ?? "error",
            signal: AbortSignal.timeout(options.timeoutMs ?? 10_000),
            dispatcher: agent,
        });
        return {
            ok: response.ok,
            status: response.status,
            bytes: await readBytesCapped(response, options.maxBytes ?? 2_000_000),
            contentType: response.headers.get("content-type"),
            location: response.headers.get("location"),
        };
    } finally {
        await agent.close();
    }
}

export async function fetchPublicHttpText(
    url: string,
    options: PublicHttpOptions = {},
): Promise<PublicHttpResult> {
    const { bytes, contentType: _contentType, ...result } = await fetchPublicHttpBytes(url, options);
    return { ...result, text: new TextDecoder().decode(bytes) };
}
