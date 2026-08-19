import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { SetupStep } from "./zapier-setup-step-items";

export function ZapierConfigureZapCard() {
    return (
        <Card className="overflow-hidden border-border bg-card">
            <CardHeader className="space-y-1 border-b border-border/60 bg-muted/15 pb-4">
                <h2 className="text-lg font-semibold tracking-tight">
                    Configure your Zap
                </h2>
                <p className="text-sm text-muted-foreground">
                    Five minutes in Zapier ,  no code needed.
                </p>
            </CardHeader>
            <CardContent className="pt-5">
                <ol className="space-y-4">
                    <SetupStep
                        index={1}
                        title="Open Zapier and create a Zap"
                        body={
                            <>
                                Go to{" "}
                                <a
                                    href="https://zapier.com/app/zaps"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    zapier.com/app/zaps
                                </a>{" "}
                                and click{" "}
                                <span className="font-medium">Create Zap</span>.
                            </>
                        }
                    />
                    <SetupStep
                        index={2}
                        title="Pick your POS or CRM as the trigger"
                        body={
                            <>
                                Examples: Square (Payment Created), Jobber (Job Completed),
                                ServiceTitan, Housecall Pro, QuickBooks (Invoice Paid),
                                Google Sheets (New Row), or anything else from the 5,000+
                                apps Zapier supports.
                            </>
                        }
                    />
                    <SetupStep
                        index={3}
                        title="Add Webhooks by Zapier as the action"
                        body={
                            <>
                                Search for <span className="font-medium">Webhooks by Zapier</span>{" "}
                                and pick the <span className="font-mono">POST</span> action.
                            </>
                        }
                    />
                    <SetupStep
                        index={4}
                        title="Paste the URL and add authentication"
                        body={
                            <>
                                Use the URL from the panel above and set{" "}
                                <span className="font-medium">Payload Type</span> to{" "}
                                <span className="font-mono">json</span>. Under Headers, add{" "}
                                <span className="font-mono">Authorization</span> with value{" "}
                                <span className="font-mono">Bearer YOUR_API_KEY</span>.
                            </>
                        }
                    />
                    <SetupStep
                        index={5}
                        title="Map the JSON fields"
                        body={
                            <>
                                Add the keys from the example payload and map them to the
                                trigger output (e.g. customer name → <span className="font-mono">name</span>,
                                customer email → <span className="font-mono">email</span>,
                                customer phone → <span className="font-mono">phone</span>).
                            </>
                        }
                    />
                    <SetupStep
                        index={6}
                        title="Test, then turn the Zap on"
                        body={
                            <>
                                Use Zapier&rsquo;s{" "}
                                <span className="font-medium">Test Action</span> to send a sample
                                through. Open{" "}
                                <Link
                                    href="/requests"
                                    className="font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    Review Requests
                                </Link>{" "}
                                to confirm it lands, then publish your Zap.
                            </>
                        }
                    />
                </ol>
            </CardContent>
        </Card>
    );
}
