const SHELL_COMMANDS = new Set([
    "git",
    "curl",
    "mkdir",
    "cp",
    "cd",
    "pnpm",
    "npm",
    "npx",
    "export",
    "source",
    "chmod",
    "echo",
    "cat",
    "ls",
    "mv",
    "rm",
    "touch",
    "open",
]);

function splitWithUrls(text: string): { text: string; url: boolean }[] {
    const out: { text: string; url: boolean }[] = [];
    const re = /(https?:\/\/[^\s]+)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        if (m.index > last) out.push({ text: text.slice(last, m.index), url: false });
        out.push({ text: m[1], url: true });
        last = m.index + m[1].length;
    }
    if (last < text.length) out.push({ text: text.slice(last), url: false });
    if (out.length === 0) out.push({ text, url: false });
    return out;
}

export function HighlightedShellLine({ line }: { line: string }) {
    const trimmed = line.trimStart();
    if (trimmed === "") {
        return <span className="block min-h-[1.25em]">&nbsp;</span>;
    }

    const leading = line.slice(0, line.length - trimmed.length);

    if (/^#/.test(trimmed)) {
        return (
            <span className="block whitespace-pre">
                {leading}
                <span className="text-muted-foreground">{trimmed}</span>
            </span>
        );
    }

    const match = trimmed.match(/^(\S+)(\s*)([\s\S]*)$/);
    if (match) {
        const [, cmd, gap, after] = match;
        if (SHELL_COMMANDS.has(cmd)) {
            return (
                <span className="block whitespace-pre">
                    {leading}
                    <span className="font-semibold text-primary">{cmd}</span>
                    {gap}
                    <span className="text-foreground">
                        {splitWithUrls(after).map((seg, i) =>
                            seg.url ? (
                                <span key={i} className="text-primary underline decoration-primary/30">
                                    {seg.text}
                                </span>
                            ) : (
                                <span key={i}>{seg.text}</span>
                            )
                        )}
                    </span>
                </span>
            );
        }
    }

    return (
        <span className="block whitespace-pre text-foreground">
            {splitWithUrls(line).map((seg, i) =>
                seg.url ? (
                    <span key={i} className="text-primary underline decoration-primary/30">
                        {seg.text}
                    </span>
                ) : (
                    <span key={i}>{seg.text}</span>
                )
            )}
        </span>
    );
}
