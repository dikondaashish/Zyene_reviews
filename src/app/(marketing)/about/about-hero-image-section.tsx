import Image from "next/image";

export function AboutHeroImageSection() {
    return (
        <div className="w-full h-56 md:h-72 rounded-lg overflow-hidden mb-8 border border-border">
            <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=400&fit=crop&q=80"
                alt="Team collaborating on review management software"
                width={900}
                height={400}
                priority
                className="object-cover size-full"
            />
        </div>
    );
}
