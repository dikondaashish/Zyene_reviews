"use client";

import { useAddBusinessPage } from "./use-add-business-page";
import {
    AddBusinessConnectView,
    AddBusinessLimitView,
    AddBusinessLoadingView,
} from "./add-business-views";

export default function AddBusinessPage() {
    const { loading, atLimit, handleConnectGoogle } = useAddBusinessPage();

    if (loading) return <AddBusinessLoadingView />;
    if (atLimit) return <AddBusinessLimitView />;
    return <AddBusinessConnectView onConnect={handleConnectGoogle} />;
}
