import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/** `**bold**`, `[label](href)` and bare site paths like `/pricing`; everything else is plain text. */
const TOKEN = /\*\*([^*]{1,200})\*\*|\[([^\]]{1,80})\]\(([^)\s]{1,300})\)|(?<=^|[\s(])(\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*)/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let last = 0;
    for (const match of text.matchAll(TOKEN)) {
        const index = match.index ?? 0;
        if (index > last) nodes.push(text.slice(last, index));
        const key = `${keyPrefix}-${index}`;
        if (match[4]) {
            nodes.push(<Link key={key} href={match[4]}>{match[4]}</Link>);
        } else if (match[1]) {
            nodes.push(<strong key={key}>{match[1]}</strong>);
        } else if (match[3]?.startsWith("/")) {
            nodes.push(<Link key={key} href={match[3]}>{match[2]}</Link>);
        } else if (match[3] && /^(https:\/\/(www\.)?zyenereviews\.com|mailto:)/.test(match[3])) {
            nodes.push(<a key={key} href={match[3]} target="_blank" rel="noopener noreferrer">{match[2]}</a>);
        } else {
            nodes.push(match[2]);
        }
        last = index + match[0].length;
    }
    if (last < text.length) nodes.push(text.slice(last));
    return nodes;
}

/** `trailing` (e.g. a typing caret) is placed inline at the end of the last block. */
export function SupportChatMessageText({ text, trailing }: { text: string; trailing?: ReactNode }) {
    const blocks = text.split(/\n{2,}/);
    const lastBlock = blocks.length - 1;
    return (
        <>
            {blocks.map((block, blockIndex) => {
                const lines = block.split("\n");
                const isList = lines.every((line) => /^\s*[-•*]\s+/.test(line));
                if (isList) {
                    return (
                        <ul key={blockIndex}>
                            {lines.map((line, i) => (
                                <li key={i}>
                                    {renderInline(line.replace(/^\s*[-•*]\s+/, ""), `${blockIndex}-${i}`)}
                                    {blockIndex === lastBlock && i === lines.length - 1 ? trailing : null}
                                </li>
                            ))}
                        </ul>
                    );
                }
                return (
                    <p key={blockIndex}>
                        {lines.map((line, i) => (
                            <Fragment key={i}>
                                {i > 0 ? <br /> : null}
                                {renderInline(line, `${blockIndex}-${i}`)}
                            </Fragment>
                        ))}
                        {blockIndex === lastBlock ? trailing : null}
                    </p>
                );
            })}
        </>
    );
}
