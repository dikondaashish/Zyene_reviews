/** F5.8: one real page, real signals. `pnpm exec tsx scripts/verify-answerability-live.ts <url>` */
import { computeAnswerabilitySignals } from "../src/services/aeo/crawler/answerability";

const url = process.argv[2];
if (!url) {
    console.error("Usage: pnpm exec tsx scripts/verify-answerability-live.ts <url>");
    process.exit(1);
}

async function main() {
    const res = await fetch(url as string);
    const html = await res.text();
    console.log(JSON.stringify(computeAnswerabilitySignals(html), null, 2));
}

main().catch((err) => {
    console.error("FAILED:", err);
    process.exit(1);
});
