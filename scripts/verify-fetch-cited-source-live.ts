import { fetchCitedSource } from "../src/services/aeo/content-briefs/fetch-cited-source";

const url = process.argv[2];
if (!url) {
    console.error("Usage: pnpm exec tsx scripts/verify-fetch-cited-source-live.ts <url>");
    process.exit(1);
}

async function main() {
    const result = await fetchCitedSource(url as string);
    console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
    console.error("FAILED:", err);
    process.exit(1);
});
