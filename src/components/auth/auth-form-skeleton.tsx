/** Placeholder with the auth form's shape, shown while a route or form loads. */
export function AuthFormSkeleton({ fields = 2 }: { fields?: number }) {
    return (
        <div className="auth-skeleton" role="status" aria-label="Loading">
            <div className="grid gap-3">
                <span className="h-8 w-3/4" />
                <span className="h-4 w-full" />
            </div>
            <span className="h-11 w-full" />
            {Array.from({ length: fields }, (_, i) => (
                <div key={i} className="grid gap-2">
                    <span className="h-4 w-24" />
                    <span className="h-11 w-full" />
                </div>
            ))}
            <span className="h-11 w-full" />
        </div>
    );
}
