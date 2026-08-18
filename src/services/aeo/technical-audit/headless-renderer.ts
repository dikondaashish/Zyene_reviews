import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { checkOriginIsPublic } from "../crawler/ssrf-guard";

export async function renderVisibleText(url: string): Promise<string> {
    const initial = await checkOriginIsPublic(url);
    if (!initial.safe) throw new Error(`Unsafe render target: ${initial.reason}`);

    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || await chromium.executablePath();
    const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath,
        headless: true,
        defaultViewport: { width: 1365, height: 768 },
    });
    try {
        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on("request", (request) => {
            void (async () => {
                const resourceUrl = request.url();
                if (!/^https?:/i.test(resourceUrl)) return request.abort();
                const safety = await checkOriginIsPublic(resourceUrl);
                if (!safety.safe) return request.abort();
                return request.continue();
            })().catch(() => request.abort());
        });
        await page.goto(url, { waitUntil: "networkidle2", timeout: 45_000 });
        return await page.$eval("body", (element) => (element as HTMLElement).innerText);
    } finally {
        await browser.close();
    }
}
