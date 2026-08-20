"use client";

import { Suspense } from "react";
import type { CustomerPortalCardProps } from "@/components/dashboard/customer-portal-card-types";
import { useCustomerPortalCard } from "@/components/dashboard/use-customer-portal-card";
import { CustomerPortalCardDecoration, CustomerPortalCardHero } from "@/components/dashboard/customer-portal-card-hero";
import { CustomerPortalCardQrPreview } from "@/components/dashboard/customer-portal-card-qr-preview";
import { CustomerPortalCardNfcUpsell } from "@/components/dashboard/customer-portal-card-nfc-upsell";
import { CustomerPortalCardActionsFooter } from "@/components/dashboard/customer-portal-card-actions-footer";
import { NfcOrderReturnToast } from "@/components/dashboard/nfc-order-return-toast";

export type { CustomerPortalCardProps } from "@/components/dashboard/customer-portal-card-types";

export function CustomerPortalCard(props: CustomerPortalCardProps) {
    const {
        copied,
        showQr,
        setShowQr,
        qrDataUrl,
        loading,
        domain,
        handleCopyLink,
        handleShare,
        handleDownload,
        handlePrint,
    } = useCustomerPortalCard(props);

    return (
        <div className="h-full rounded-[24px] bg-[rgb(34,49,34)] p-6 lg:p-8 flex flex-col justify-between overflow-hidden relative border border-[rgba(62,74,62,0.3)] shadow-sm min-h-[360px]">
            <CustomerPortalCardDecoration />
            <CustomerPortalCardHero />
            <CustomerPortalCardQrPreview loading={loading} qrDataUrl={qrDataUrl} />
            <CustomerPortalCardNfcUpsell businessName={props.businessName || "your business"} />
            <CustomerPortalCardActionsFooter
                domain={domain}
                businessSlug={props.businessSlug}
                copied={copied}
                showQr={showQr}
                onShowQrChange={setShowQr}
                loading={loading}
                qrDataUrl={qrDataUrl}
                onCopyLink={handleCopyLink}
                onShare={handleShare}
                onDownload={handleDownload}
                onPrint={handlePrint}
            />
            <Suspense fallback={null}>
                <NfcOrderReturnToast />
            </Suspense>
        </div>
    );
}
