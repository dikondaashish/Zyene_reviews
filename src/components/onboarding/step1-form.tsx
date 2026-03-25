"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, ChevronRight } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Removed local progress bar - now in shell */}

      <div>
        <h2 className="text-3xl font-bold text-gray-900">Set up your organization</h2>
        <p className="text-gray-600 mt-2">
          Give your organization a name (e.g. your company or brand).
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor="organizationName" className="font-semibold">
                    Organization name
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-slate-400 cursor-help" />
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
                    placeholder="Acme Inc."
                    disabled={submitting || isLoading}
                    className="text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={!form.formState.isValid || submitting || isLoading}
            className="w-full text-base py-6"
          >
            {submitting || isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}
