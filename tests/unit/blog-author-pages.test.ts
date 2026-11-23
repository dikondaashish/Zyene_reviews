import { describe, expect, it } from "vitest";
import { blogAuthorPath, blogAuthorSlug, DEFAULT_BLOG_AUTHOR } from "../../src/lib/content/blog-authors";
import { BLOG_AUTHOR_PAGES } from "../../src/lib/content/blog-author-directory";
import { BLOG_AUTHOR_PROFILES } from "../../src/lib/content/blog-author-profiles";
import { BLOG_POSTS } from "../../src/lib/content/blog-data";
import { buildBlogAuthorSchema } from "../../src/lib/seo/blog-author-schema";

describe("blog author pages", () => {
    it("slugifies author names", () => {
        expect(blogAuthorSlug("Dr. Elena Rostova")).toBe("dr-elena-rostova");
        expect(blogAuthorSlug(" Karthik ")).toBe("karthik");
    });

    it("gives every named author exactly one page covering all their posts", () => {
        const named = BLOG_POSTS.filter((post) => post.author.name !== DEFAULT_BLOG_AUTHOR.name);
        expect(new Set(BLOG_AUTHOR_PAGES.map((page) => page.slug)).size).toBe(BLOG_AUTHOR_PAGES.length);
        expect(BLOG_AUTHOR_PAGES.reduce((total, page) => total + page.posts.length, 0)).toBe(named.length);
    });

    it("has no page for the team byline and marks it as an organization", () => {
        expect(blogAuthorPath(DEFAULT_BLOG_AUTHOR)).toBeNull();
        expect(buildBlogAuthorSchema(DEFAULT_BLOG_AUTHOR)["@type"]).toBe("Organization");
    });

    it("links a named author to their page in structured data", () => {
        const schema = buildBlogAuthorSchema({ name: "Karthik", role: "Founder" });
        expect(schema["@type"]).toBe("Person");
        expect(String(schema.url)).toMatch(/\/blog\/author\/karthik$/);
    });

    it("only stores profiles for authors that exist", () => {
        const slugs = new Set(BLOG_AUTHOR_PAGES.map((page) => page.slug));
        for (const slug of Object.keys(BLOG_AUTHOR_PROFILES)) expect(slugs.has(slug), slug).toBe(true);
    });
});
