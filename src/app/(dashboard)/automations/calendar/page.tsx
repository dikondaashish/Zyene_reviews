import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/db/supabase/server";
import { getActiveBusinessId } from "@/lib/auth/business-context";
import { userCanAccessBusiness } from "@/lib/db/supabase/verify-business-access";
import { dayKey, resolveCalendarMonth } from "@/lib/automations/activity-calendar";
import { loadActivityCalendar } from "@/services/automations/load-activity-calendar";
import { ActivityCalendar } from "@/components/automations/calendar/activity-calendar";

export const metadata = {
    title: "Activity calendar",
    description: "Everything Zyene sent, posted and scheduled for your business, day by day.",
};

function validTimeZone(tz: unknown): string {
    if (typeof tz !== "string" || !tz) return "UTC";
    try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        return tz;
    } catch {
        return "UTC";
    }
}

export default async function ActivityCalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
    const [{ month: monthParam }, supabase] = await Promise.all([searchParams, createClient()]);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const { businessId } = await getActiveBusinessId();
    if (!businessId || !(await userCanAccessBusiness(supabase, user.id, businessId))) redirect("/dashboard");

    const { data: business } = await supabase.from("businesses").select("timezone").eq("id", businessId).maybeSingle();
    const timeZone = validTimeZone(business?.timezone);
    const now = new Date();
    const month = resolveCalendarMonth(monthParam, now, timeZone);
    const { events, capped } = await loadActivityCalendar(supabase, businessId, month);

    return (
        <div className="flex min-w-0 flex-col gap-6 p-4 md:p-8">
            <header>
                <Link href="/automations" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="size-3.5" aria-hidden />Automations
                </Link>
                <h1 className="ui-page-title mt-2">Activity calendar</h1>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Every review request, reminder and reply Zyene sent for you, what is scheduled next, and the reviews that came in.
                    Times are in {timeZone === "UTC" ? "UTC" : timeZone.replace(/_/g, " ")}.
                </p>
            </header>
            <ActivityCalendar key={month.param} month={month} events={events} timeZone={timeZone} todayKey={dayKey(now.toISOString(), timeZone)} capped={capped} />
        </div>
    );
}
