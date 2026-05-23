import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    Handshake,
    Store,
    Users,
    Zap,
    Globe,
    Mail,
    BarChart3,
} from "lucide-react";

export const CHANNEL_ICONS = {
    pos: Store,
    association: Users,
    agency: Handshake,
    zapier: Zap,
    google: Globe,
} as const;
