export function Step2ChainIcon() {
    return (
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
            <defs>
                <linearGradient id="chain-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.6" />
                </linearGradient>
            </defs>
            <path
                d="M26 38L38 26M22 26L14 34C11.7909 36.2091 11.7909 39.7909 14 42L22 50C24.2091 52.2091 27.7909 52.2091 30 50L34 46M30 18L34 14C36.2091 11.7909 39.7909 11.7909 42 14L50 22C52.2091 24.2091 52.2091 27.7909 50 30L42 38C39.7909 40.2091 36.2091 40.2091 34 38"
                stroke="url(#chain-grad)"
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    );
}

export function Step2GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="rgb(66,133,244)"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="rgb(52,168,83)"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="rgb(251,188,5)"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="rgb(234,67,53)"
            />
        </svg>
    );
}
