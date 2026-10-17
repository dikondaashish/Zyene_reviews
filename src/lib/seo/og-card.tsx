import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";

/**
 * One social share card (Open Graph + X) for every marketing route, in the current brand:
 * warm cream canvas with the hero's colour mesh, the real logo, Geist type, and the page's
 * own photo on the right when it has one (blog covers, industry photos).
 * Fonts: Geist (SIL Open Font License), vendored in src/assets/fonts.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export interface OgCardInput {
    /** Short context line above the title, e.g. "Features" or "Blog · Google Reviews". */
    eyebrow: string;
    title: string;
    subtitle?: string;
    /** Public path of a photo to show on the right, e.g. "/images/blog/covers/x.webp". */
    image?: string;
}

const ROOT = process.cwd();
const INK = "#23262a";
const MUTED = "#505763";
const ORANGE = "#ed5a29";

async function publicImage(publicPath: string, width: number, height: number, format: "jpeg" | "png") {
    const file = await readFile(path.join(ROOT, "public", decodeURIComponent(publicPath)));
    const pipeline = sharp(file).resize(width, height, { fit: "cover", position: "attention" });
    const buffer = format === "png" ? await pipeline.png().toBuffer() : await pipeline.jpeg({ quality: 82 }).toBuffer();
    return `data:image/${format};base64,${buffer.toString("base64")}`;
}

async function loadAssets(image?: string) {
    const [regular, semibold, logo, photo] = await Promise.all([
        readFile(path.join(ROOT, "src/assets/fonts/geist-regular.ttf")),
        readFile(path.join(ROOT, "src/assets/fonts/geist-semibold-latin.woff")),
        publicImage("/Main logo.png", 112, 112, "png"),
        image ? publicImage(image, 880, 1100, "jpeg").catch(() => null) : Promise.resolve(null),
    ]);
    return { regular, semibold, logo, photo };
}

const MESH = [
    "radial-gradient(circle at 12% 18%, rgba(255,206,178,0.9) 0%, rgba(255,206,178,0) 40%)",
    "radial-gradient(circle at 46% 8%, rgba(255,233,186,0.75) 0%, rgba(255,233,186,0) 38%)",
    "radial-gradient(circle at 88% 30%, rgba(214,204,250,0.55) 0%, rgba(214,204,250,0) 40%)",
    "radial-gradient(circle at 70% 92%, rgba(255,160,124,0.45) 0%, rgba(255,160,124,0) 42%)",
    "radial-gradient(circle at 20% 96%, rgba(250,205,220,0.7) 0%, rgba(250,205,220,0) 40%)",
    "linear-gradient(165deg, #fffaf4 0%, #fff3ea 55%, #fdeee9 100%)",
].join(", ");

/** Keeps long standfirsts to about two lines on the card. */
function clamp(text: string | undefined, max = 120) {
    if (!text || text.length <= max) return text;
    return `${text.slice(0, text.lastIndexOf(" ", max))}…`;
}

export async function renderOgCard({ eyebrow, title, subtitle: rawSubtitle, image }: OgCardInput) {
    const { regular, semibold, logo, photo } = await loadAssets(image);
    const subtitle = clamp(rawSubtitle);
    const titleSize = title.length > 70 ? 50 : title.length > 44 ? 58 : 66;

    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", padding: 56, backgroundImage: MESH, fontFamily: "Geist", color: INK }}>
                <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: photo ? 48 : 40 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
                        <img src={logo} width={52} height={52} style={{ borderRadius: 12 }} alt="" />
                        <div style={{ display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: -1 }}>
                            <span style={{ color: ORANGE }}>Zyene</span>
                            <span style={{ marginLeft: 8 }}>Reviews</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
                        <div style={{ fontSize: 24, color: MUTED, marginBottom: 16 }}>{eyebrow}</div>
                        <div style={{ fontSize: titleSize, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2.4 }}>{title}</div>
                        {subtitle ? <div style={{ fontSize: 26, color: MUTED, lineHeight: 1.4, marginTop: 20 }}>{subtitle}</div> : null}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 36 }}>
                        <div style={{ display: "flex", padding: "10px 20px", borderRadius: 999, background: ORANGE, color: "#ffffff", fontSize: 22, fontWeight: 600 }}>
                            Start free trial
                        </div>
                        <div style={{ fontSize: 22, color: MUTED }}>zyenereviews.com</div>
                    </div>
                </div>
                {photo ? (
                    <div style={{ display: "flex", width: 400, height: 518, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 60px rgba(35,38,42,0.22)" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain <img> */}
                        <img src={photo} width={400} height={518} style={{ objectFit: "cover" }} alt="" />
                    </div>
                ) : null}
            </div>
        ),
        {
            ...OG_SIZE,
            fonts: [
                { name: "Geist", data: regular, weight: 400, style: "normal" },
                { name: "Geist", data: semibold, weight: 600, style: "normal" },
            ],
        },
    );
}
