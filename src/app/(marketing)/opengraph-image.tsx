import { ImageResponse } from "next/og";
import { OpenGraphImageContent } from "./opengraph-image-content";

export const runtime = "edge";
export const alt = "Zyene Reviews ,  Reputation Management for Local Businesses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
    return new ImageResponse(<OpenGraphImageContent />, { ...size });
}
