const GRAPH_BASE_URL = "https://graph.facebook.com/v19.0";

export function getAppId(): string {
    const id = process.env.FACEBOOK_APP_ID;
    if (!id) throw new Error("FACEBOOK_APP_ID environment variable is not set");
    return id;
}

export function getAppSecret(): string {
    const secret = process.env.FACEBOOK_APP_SECRET;
    if (!secret)
        throw new Error("FACEBOOK_APP_SECRET environment variable is not set");
    return secret;
}

interface GraphRequestOptions {
    path: string;
    params?: Record<string, string>;
    method?: "GET" | "POST";
    body?: Record<string, string>;
}

export async function graphFetch<T>(options: GraphRequestOptions): Promise<T> {
    const url = new URL(`${GRAPH_BASE_URL}${options.path}`);

    if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const fetchOptions: RequestInit = {
        method: options.method || "GET",
        headers: { Accept: "application/json" },
    };

    if (options.method === "POST" && options.body) {
        fetchOptions.headers = {
            ...fetchOptions.headers,
            "Content-Type": "application/json",
        };
        fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
        const errorBody = await response.text();
        console.error(`[Facebook Graph API] ${response.status}: ${errorBody}`);
        throw new Error(
            `Facebook Graph API error: ${response.status} ${response.statusText}`
        );
    }

    return response.json() as Promise<T>;
}

/**
 * Exchange an authorization code for a short-lived user access token.
 */
export async function exchangeCodeForToken(
    code: string,
    redirectUri: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    return graphFetch({
        path: "/oauth/access_token",
        params: {
            client_id: getAppId(),
            client_secret: getAppSecret(),
            redirect_uri: redirectUri,
            code,
        },
    });
}

/**
 * Exchange a short-lived token for a long-lived user access token (~60 days).
 */
export async function getLongLivedToken(
    shortLivedToken: string
): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    return graphFetch({
        path: "/oauth/access_token",
        params: {
            grant_type: "fb_exchange_token",
            client_id: getAppId(),
            client_secret: getAppSecret(),
            fb_exchange_token: shortLivedToken,
        },
    });
}
