"use client";

import { DemoBookingCalendar } from "@/components/marketing/demo-booking-calendar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCalComEmbedUrlFromEnv } from "@/lib/enterprise/cal-com-embed";
import { X } from "lucide-react";

type MarketingAppointmentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MarketingAppointmentDialog({ open, onOpenChange }: MarketingAppointmentDialogProps) {
  const calComEmbedUrl = getCalComEmbedUrlFromEnv();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[min(92dvh,840px)] max-w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-5xl"
        showCloseButton={false}
      >
        <DialogHeader className="relative border-b border-border px-5 py-4 pr-14 text-left sm:px-6">
          <DialogTitle>Book a Zyene Reviews demo</DialogTitle>
          <DialogDescription>
            Pick a 30-minute time that works for you.
          </DialogDescription>
          <DialogClose
            aria-label="Close booking calendar"
            className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </DialogClose>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
          {calComEmbedUrl ? (
            <DemoBookingCalendar src={calComEmbedUrl} />
          ) : (
            <p className="rounded-xl border border-dashed border-border bg-muted/40 p-8 text-center text-sm text-muted-foreground">
              The booking calendar is unavailable right now. Please use our contact page and we’ll arrange a time.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
