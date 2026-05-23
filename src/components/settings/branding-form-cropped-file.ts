import type { PixelCrop } from "react-image-crop";

export async function getBrandingCroppedImageFile(
    image: HTMLImageElement,
    crop: PixelCrop,
    fileName: string
): Promise<File> {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("No 2d context");
    }

    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        512,
        512
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("Canvas is empty"));
                return;
            }
            resolve(new File([blob], fileName, { type: "image/webp" }));
        }, "image/webp", 0.95);
    });
}
