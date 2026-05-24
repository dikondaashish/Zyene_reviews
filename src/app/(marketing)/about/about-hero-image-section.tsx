import Image from "next/image";

import { marketingImages } from "@/lib/marketing/marketing-images";

export function AboutHeroImageSection() {
    return (
        <div className="w-full h-56 md:h-72 rounded-lg overflow-hidden mb-8 border border-border">
            <Image
                src={marketingImages.about.hero.src}
                alt={marketingImages.about.hero.alt}
                width={marketingImages.about.hero.width}
                height={marketingImages.about.hero.height}
                priority
                className="object-cover size-full"
            />
        </div>
    );
}
