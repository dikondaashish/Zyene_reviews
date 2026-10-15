import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { BLOG_POSTS, BLOG_POST_MAP, DEFAULT_BLOG_AUTHOR } from "@/lib/content/blog-data";
import { countBlogWords, estimateReadMinutes } from "@/lib/content/blog-read-time";

const POST_FILES = readdirSync(resolve(process.cwd(), "src/lib/content/blog-posts"))
    .filter((file) => file !== "index.ts")
    .map((file) => file.replace(/\.ts$/, ""));

describe("blog post structure", () => {
    it("keeps one file per post, named by its slug", () => {
        expect(POST_FILES.sort()).toEqual(BLOG_POSTS.map((post) => post.slug).sort());
    });

    it.each(BLOG_POSTS.map((post) => [post.slug, post] as const))("%s follows the article template", (_, post) => {
        expect(post.metaTitle.length).toBeLessThanOrEqual(60);
        expect(post.metaDescription.length).toBeLessThanOrEqual(160);
        expect(post.body[0]?.type).toBe("summary");
        expect(post.faqs?.length ?? 0).toBeGreaterThanOrEqual(2);
        expect((post.dateModified ?? post.publishedAt) >= post.publishedAt).toBe(true);
        expect(post.image).toBeDefined();
        for (const slug of post.relatedSlugs) expect(BLOG_POST_MAP[slug], slug).toBeDefined();
        for (const link of post.internalLinks.filter((l) => l.href.startsWith("/blog/"))) {
            expect(BLOG_POST_MAP[link.href.slice("/blog/".length)], link.href).toBeDefined();
        }
    });

    it("uses one label for team-written posts", () => {
        const teamAuthors = BLOG_POSTS.map((post) => post.author).filter((author) => /zyene/i.test(author.name));
        for (const author of teamAuthors) expect(author).toEqual(DEFAULT_BLOG_AUTHOR);
    });
});

describe("estimateReadMinutes", () => {
    it("derives read time from the words in the post", () => {
        for (const post of BLOG_POSTS) {
            expect(post.readMinutes).toBe(Math.max(1, Math.ceil(countBlogWords(post) / 230)));
        }
    });

    it("never returns less than one minute", () => {
        const empty = { ...BLOG_POSTS[0]!, body: [], faqs: [] };
        expect(estimateReadMinutes(empty)).toBe(1);
    });
});
