import { Building2, Mail, Shield, Users } from "lucide-react";

export function AboutMissionSection() {
    return (
        <>
                    <h1 className="text-4xl font-bold text-foreground mb-4">About Zyene Reviews</h1>
                    <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                        Zyene Reviews is a product of{" "}
                        <strong>
                            <a
                                href="https://zyene.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:brightness-90 underline-offset-2 hover:underline"
                            >
                                Zyene, Inc
                            </a>
                        </strong>
                        . We build software that helps local businesses manage their online reputation—so they can
                        focus on what they do best: serving their customers.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0 border border-primary/20 size-12">
                                <Building2 className="size-6" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground mb-1">Our Mission</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    To make online reputation management accessible and simple for every local business,
                                    regardless of size or technical ability.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0 border border-primary/20 size-12">
                                <Users className="size-6" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground mb-1">Who We Serve</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Restaurants, dental offices, auto shops, salons, and thousands of other local businesses
                                    that rely on customer reviews to grow.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0 border border-primary/20 size-12">
                                <Shield className="size-6" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground mb-1">Our Values</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    We believe in ethical review practices. We never engage in review gating, incentivized reviews,
                                    or any practice that violates platform policies.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="bg-primary/10 text-primary rounded-md flex items-center justify-center shrink-0 border border-primary/20 size-12">
                                <Mail className="size-6" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-foreground mb-1">Get in Touch</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Questions? Feedback? We&apos;d love to hear from you.<br />
                                    Email us at{" "}
                                    <a href="mailto:support@zyenereviews.com" className="text-primary hover:brightness-90 font-medium">
                                        support@zyenereviews.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
        </>
    );
}
