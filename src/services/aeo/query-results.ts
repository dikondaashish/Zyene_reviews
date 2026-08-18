type QueryResult = { error?: { message: string } | null };

export function assertAeoQueriesSucceeded(context: string, ...results: QueryResult[]): void {
    const failure = results.find((result) => result.error)?.error;
    if (failure) throw new Error(`${context}: ${failure.message}`);
}
