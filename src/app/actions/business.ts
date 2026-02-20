"use server";

import { cookies } from "next/headers";

export async function setActiveBusiness(businessId: string) {
    (await cookies()).set("active_business_id", businessId, {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });
}
