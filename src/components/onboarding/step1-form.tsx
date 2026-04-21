"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Building2, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { stepOrganizationSchema, type StepOrganizationFormData } from "@/lib/validations/onboarding";
import { updateOrganizationName } from "@/app/actions/onboarding";

interface Step1Props {
  onNext: () => void;
  isLoading: boolean;
  organizationId: string;
  initialOrgName?: string;
}

export function Step1Form({
  onNext,
  isLoading,
  organizationId,
  initialOrgName = "",
}: Step1Props) {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<StepOrganizationFormData>({
    resolver: zodResolver(stepOrganizationSchema),
    mode: "onChange",
    defaultValues: {
      organizationName: initialOrgName,
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialOrgName) {
      form.setValue("organizationName", initialOrgName);
    }
  }, [initialOrgName, form]);

  const onSubmit = async (data: StepOrganizationFormData) => {
    setSubmitting(true);
    try {
      const result = await updateOrganizationName(organizationId, data.organizationName);
      if (result.success) {
        toast.success("Organization name saved!");
        onNext();
      } else {
        toast.error(result.error || "Failed to save");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
          className="inline-flex"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 mx-auto">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
        </motion.div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Name your workspace
          </h2>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
            This is your organization — the umbrella for all your business locations.
          </p>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2 mb-1.5">
                  <Label htmlFor="organizationName" className="text-sm font-semibold text-foreground">
                    Organization name
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px] p-3 text-xs leading-relaxed">
                        <p>Your <strong>Organization</strong> is the umbrella account that owns one or more business locations. Most users just use their company name here.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <FormControl>
                  <Input
                    id="organizationName"
                    placeholder="e.g. Acme Inc."
                    autoFocus
                    disabled={submitting || isLoading}
                    className="h-14 text-base bg-background/60 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl transition-all placeholder:text-muted-foreground/50"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground/70 mt-1.5">
                  Don't worry, you can rename your organization later.
                </p>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!form.formState.isValid || submitting || isLoading}
            className="w-full h-14 text-base font-semibold cta-button"
          >
            {submitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Tip */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-start gap-3 p-4 bg-primary/[0.04] border border-primary/10 rounded-2xl"
      >
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Quick setup</span> — Most users complete onboarding in under 2 minutes. We'll guide you through each step.
        </p>
      </motion.div>
    </div>
  );
}
