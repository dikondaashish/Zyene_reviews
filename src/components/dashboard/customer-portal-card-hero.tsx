export function CustomerPortalCardDecoration() {
    return (
        <svg
            className="absolute -right-8 -top-8 w-[280px] h-[280px] opacity-[0.03] text-white pointer-events-none"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill="currentColor"
                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.6,-46.3C91.4,-33.5,98,-18.1,97.7,-2.8C97.4,12.5,90.2,27.7,80.1,40.6C70,53.5,57.1,64.1,42.8,71.4C28.5,78.7,12.8,82.8,-1.9,86.1C-16.7,89.4,-30.3,91.9,-43.3,86.9C-56.3,81.9,-68.8,69.5,-78.1,55.1C-87.5,40.8,-93.8,24.6,-94.1,8.4C-94.4,-7.8,-88.7,-24,-79.3,-38C-69.8,-52,-56.7,-63.9,-42.6,-71C-28.5,-78.1,-13.4,-80.4,1.4,-82.9C16.3,-85.4,30.6,-83.6,44.7,-76.4Z"
                transform="translate(100 100)"
            />
        </svg>
    );
}

export function CustomerPortalCardHero() {
    return (
        <div className="relative z-10">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">YOUR CUSTOMER PORTAL</p>
            <h2
                className="text-[28px] font-serif text-white/95 leading-tight mb-3"
                style={{ fontFamily: "Georgia, serif" }}
            >
                Share it. Collect reviews.
                <br />
                Drive repeat orders.
            </h2>
            <p className="text-[13px] text-white/60 leading-relaxed max-w-[90%] mb-1">
                One link. Leave it on receipts, tables, or the door. We handle the rest.
            </p>
        </div>
    );
}
