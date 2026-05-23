export function AboutHeroImageSection() {
    return (
        <div className="w-full h-56 md:h-72 rounded-lg overflow-hidden mb-8 border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=400&fit=crop&q=80"
                alt="Team collaborating on review management software"
                className="w-full h-full object-cover"
            />
        </div>
    );
}
