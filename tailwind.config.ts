import type { Config } from "tailwindcss";

/**
 * Tailwind v4 uses `@theme` in `src/app/globals.css` as the source of truth for design tokens.
 * This file exists for tooling compatibility (IDE plugins, linters) and documents `content` paths.
 */
export default {
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
} satisfies Config;
