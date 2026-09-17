"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type ServiceDraft = { name: string; description: string };
export type PostDraft = {
    topicType: string;
    summary: string;
    rationale: string;
};

type GbpContentDraftListsProps = {
    services: ServiceDraft[];
    posts: PostDraft[];
    publishingIndex: number | null;
    onPublishPost: (post: PostDraft, index: number) => void;
};

export function GbpContentDraftLists({ services, posts, publishingIndex, onPublishPost }: GbpContentDraftListsProps) {
    return (
        <>
            {services.length > 0 ? (
                <ul className="space-y-3">
                    {services.map((service) => (
                        <li key={service.name} className="rounded-lg border p-3">
                            <p className="text-sm font-medium">{service.name}</p>
                            <p className="text-muted-foreground mt-1 text-sm">{service.description}</p>
                        </li>
                    ))}
                </ul>
            ) : null}

            {posts.length > 0 ? (
                <ul className="space-y-3">
                    {posts.map((post, index) => (
                        <li key={`${post.topicType}:${post.summary}`} className="rounded-lg border p-3">
                            <Badge variant="secondary" className="text-xs">
                                {post.topicType}
                            </Badge>
                            <p className="mt-2 text-sm">{post.summary}</p>
                            <p className="text-muted-foreground mt-1 text-xs">{post.rationale}</p>
                            <Button
                                className="mt-2"
                                size="sm"
                                onClick={() => onPublishPost(post, index)}
                                disabled={publishingIndex !== null}
                            >
                                {publishingIndex === index ? "Publishing…" : "Publish to Google"}
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </>
    );
}
