# Complete 4-Step Onboarding Flow Implementation

**Current Status:** Zyene Reviews with working auth at auth.zyenereviews.com  
**Target:** Implement 4-step onboarding at app.zyenereviews.com/onboarding  
**Timeline:** 2-3 days

---

## DOMAIN & URL STRUCTURE

```
https://www.zyenereviews.com/                    (Landing page)
├─ "Log In" → https://auth.zyenereviews.com/login
└─ "Start Free Trial" → https://auth.zyenereviews.com/signup

https://auth.zyenereviews.com/signup              (Auth signup)
├─ Email validation
├─ Password setup
└─ On success → Redirect to:
   
https://app.zyenereviews.com/onboarding           (4-Step Onboarding starts HERE)
│
├─ Step 1: Setup Organization Name
│  Input: Organization Name (Auto-fill from email domain or manual)
│  Save to: organizations table
│  Next: → Step 2
│
├─ Step 2: Business Name + Google Connection + First Location
│  Choice A: Manual Entry
│    - Business Name (text input)
│    - Optional: First Location (Name, Address, City, State, Phone)
│    - Save to: businesses + locations tables
│
│  Choice B: Google Auto-fill
│    - Click "Connect Google Business Profile"
│    - OAuth login → Auto-fetch business name, address from Google
│    - User can edit/confirm before saving
│    - Save to: businesses + locations tables
│    - Also create review_platforms record (Google)
│
│  Next: → Step 3
│
├─ Step 3: Category Selection
│  Radio buttons: Restaurant, Coffee Shop, Salon, Dental, Gym, etc.
│  Save category to: businesses.category
│  Next: → Step 4
│
└─ Step 4: Notifications + Confetti + Dashboard
   ├─ Email alerts: toggle
   ├─ SMS alerts: toggle (optional phone)
   ├─ Save to: notification_preferences table
   ├─ Show confetti animation ✨
   └─ Redirect to: https://app.zyenereviews.com/dashboard
```

---

## DATABASE SCHEMA (ALREADY EXISTS)

### 1. Organizations Table ✅
```sql
CREATE TABLE organizations (
  id uuid PRIMARY KEY,
  name varchar,                    -- Step 1 input
  slug varchar UNIQUE,
  type varchar ('business' | 'agency'),
  stripe_customer_id varchar,
  stripe_subscription_id varchar,
  plan varchar,                    -- Starter | Professional | Enterprise
  plan_status varchar,
  trial_ends_at timestamptz,
  max_businesses integer,
  created_at timestamptz,
  updated_at timestamptz
);
```

### 2. Businesses Table ✅
```sql
CREATE TABLE businesses (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  name varchar,                   -- Step 2 input (manual or from Google)
  slug varchar UNIQUE,
  category varchar,               -- Step 3 input
  city varchar,
  google_business_id varchar,
  onboarding_completed boolean,
  created_at timestamptz,
  updated_at timestamptz
);
```

### 3. Locations Table (NEEDS VERIFICATION) ⚠️
```sql
CREATE TABLE locations (
  id uuid PRIMARY KEY,
  business_id uuid REFERENCES businesses(id),
  name varchar,                   -- Step 2: Location Name
  address varchar,                -- Step 2: Address
  city varchar,                   -- Step 2: City
  state varchar,                  -- Step 2: State
  phone varchar,                  -- Step 2: Phone (optional)
  slug varchar UNIQUE,
  is_primary boolean DEFAULT false,
  google_place_id varchar,
  created_at timestamptz,
  updated_at timestamptz
);
```

### 4. Notification Preferences Table ✅
```sql
CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY,
  business_id uuid REFERENCES businesses(id),
  email_alerts boolean DEFAULT true,
  sms_alerts boolean DEFAULT false,
  phone varchar,                  -- Step 4: Optional phone for SMS
  created_at timestamptz,
  updated_at timestamptz
);
```

### 5. Review Platforms Table ✅ (For Google Connection)
```sql
CREATE TABLE review_platforms (
  id uuid PRIMARY KEY,
  business_id uuid REFERENCES businesses(id),
  platform varchar ('google' | 'yelp' | 'facebook' | 'api'),
  access_token varchar (encrypted),
  last_synced_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);
```

---

## IMPLEMENTATION ROADMAP

### PHASE 1: Database Verification & Migrations

**Check if locations table exists:**
```bash
SELECT * FROM information_schema.tables WHERE table_name = 'locations';
```

**If missing, create locations migration:**
```sql
-- File: supabase/migrations/20260313_verify_locations_table.sql
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  phone text,
  slug text UNIQUE,
  google_place_id varchar,
  is_primary boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access locations of businesses they own
CREATE POLICY locations_access ON locations
  FOR SELECT USING (
    business_id IN (
      SELECT b.id FROM businesses b
      WHERE b.organization_id IN (
        SELECT om.organization_id FROM organization_members om
        WHERE om.user_id = auth.uid()
      )
    )
  );
```

---

### PHASE 2: Frontend Components (4 Steps)

#### Step 1: Organization Name
**File:** `src/components/onboarding/step1-organization.tsx`

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { createOrganization } from "@/app/actions/onboarding";

const step1Schema = z.object({
  organizationName: z
    .string()
    .min(1, "Organization name is required")
    .min(3, "Must be at least 3 characters")
    .max(100, "Must be less than 100 characters")
});

type Step1FormData = z.infer<typeof step1Schema>;

interface Step1Props {
  onNext: (data: { organizationId: string; organizationName: string }) => void;
}

export default function Step1Organization({ onNext }: Step1Props) {
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    mode: "onChange"
  });

  const onSubmit = async (data: Step1FormData) => {
    setSubmitting(true);
    try {
      const result = await createOrganization(data.organizationName);
      
      if (!result.success) {
        toast.error(result.error || "Failed to create organization");
        return;
      }

      toast.success("Organization created! Let's set up your business.");
      onNext({
        organizationId: result.organization.id,
        organizationName: result.organization.name
      });
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome to Zyene Reviews</h2>
        <p className="text-gray-600 mt-1">
          Let's set up your organization first
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
            Organization Name
          </Label>
          <Input
            id="organizationName"
            type="text"
            placeholder="e.g., Alex Morgan's Coffee Shops"
            autoFocus
            disabled={submitting}
            {...register("organizationName")}
            className="mt-1"
          />
          {errors.organizationName && (
            <p className="text-red-500 text-sm mt-1">{errors.organizationName.message}</p>
          )}
          <p className="text-gray-500 text-xs mt-2">
            This is your company name. You can manage multiple businesses under this organization.
          </p>
        </div>

        <Button
          type="submit"
          disabled={!isValid || submitting}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
```

---

#### Step 2: Business Name + Google Connection + Location
**File:** `src/components/onboarding/step2-business.tsx`

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ChevronLeft, Cloud } from "lucide-react";
import { toast } from "sonner";
import { createBusinessWithLocation, createBusinessFromGoogle } from "@/app/actions/onboarding";

const step2Schema = z.object({
  businessName: z
    .string()
    .min(1, "Business name is required")
    .max(100),
  locationName: z
    .string()
    .min(1, "Location name is required")
    .max(100),
  address: z
    .string()
    .min(5, "Address is required")
    .max(200),
  city: z
    .string()
    .min(1, "City is required")
    .max(50),
  state: z
    .string()
    .min(2, "State code required (e.g., CA)")
    .max(2),
  phone: z
    .string()
    .regex(/^[\d\-\+\(\)\ ]*$/, "Invalid phone number")
    .optional()
});

type Step2FormData = z.infer<typeof step2Schema>;

interface Step2Props {
  organizationId: string;
  onNext: (data: { businessId: string; businessName: string }) => void;
  onBack: () => void;
}

export default function Step2Business({ organizationId, onNext, onBack }: Step2Props) {
  const [mode, setMode] = useState<"manual" | "google" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: "onChange",
    defaultValues: {
      locationName: "",
      state: ""
    }
  });

  const businessName = watch("businessName");

  // Auto-fill location name
  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("locationName", `${e.target.value} - Main`, { shouldValidate: true });
  };

  const onSubmit = async (data: Step2FormData) => {
    setSubmitting(true);
    try {
      const result = await createBusinessWithLocation(organizationId, data);
      
      if (!result.success) {
        toast.error(result.error || "Failed to create business");
        return;
      }

      toast.success("Business created! Let's select your category.");
      onNext({
        businessId: result.business.id,
        businessName: result.business.name
      });
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleConnect = async () => {
    setSubmitting(true);
    try {
      // Redirect to Google OAuth flow
      window.location.href = `/api/integrations/google/authorize?org_id=${organizationId}`;
    } catch (error) {
      toast.error("Failed to connect Google");
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === null) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Set up your business</h2>
          <p className="text-gray-600 mt-1">
            How would you like to add your business?
          </p>
        </div>

        <div className="space-y-3">
          {/* Manual Entry Option */}
          <button
            onClick={() => setMode("manual")}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-left"
          >
            <h3 className="font-semibold text-gray-900">Manual Entry</h3>
            <p className="text-sm text-gray-600 mt-1">
              Enter your business name and location manually
            </p>
          </button>

          {/* Google Auto-fill Option */}
          <button
            onClick={() => setMode("google")}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-left"
          >
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Google Business Profile</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Auto-fill from your Google Business listing
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  if (mode === "google") {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Connect Google Business Profile</h2>
          <p className="text-gray-600 mt-1">
            Sign in with your Google account to auto-fill your business details
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            We'll automatically populate your business name, address, and location from your Google Business Profile.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setMode(null)}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleGoogleConnect}
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Connect Google
          </Button>
        </div>
      </div>
    );
  }

  // Manual Entry Mode
  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add your business</h2>
        <p className="text-gray-600 mt-1">
          Enter your business name and location
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Business Name */}
        <div>
          <Label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Business Name
          </Label>
          <Input
            id="businessName"
            placeholder="e.g., Morgan's Coffee Shop"
            disabled={submitting}
            {...register("businessName")}
            onChange={(e) => {
              register("businessName").onChange(e);
              handleBusinessNameChange(e);
            }}
            className="mt-1"
          />
          {errors.businessName && (
            <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>
          )}
        </div>

        {/* Location Name */}
        <div>
          <Label htmlFor="locationName" className="block text-sm font-medium text-gray-700">
            Location Name
          </Label>
          <Input
            id="locationName"
            placeholder="e.g., Downtown Store"
            disabled={submitting}
            {...register("locationName")}
            className="mt-1"
          />
          {errors.locationName && (
            <p className="text-red-500 text-sm mt-1">{errors.locationName.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Street Address
          </Label>
          <Input
            id="address"
            placeholder="e.g., 123 Main Street"
            disabled={submitting}
            {...register("address")}
            className="mt-1"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
          )}
        </div>

        {/* City & State */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </Label>
            <Input
              id="city"
              placeholder="e.g., San Francisco"
              disabled={submitting}
              {...register("city")}
              className="mt-1"
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </Label>
            <Input
              id="state"
              placeholder="CA"
              maxLength={2}
              disabled={submitting}
              {...register("state")}
              className="mt-1 uppercase"
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
            )}
          </div>
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone (Optional)
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            disabled={submitting}
            {...register("phone")}
            className="mt-1"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setMode(null)}
            disabled={submitting}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={!isValid || submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

#### Step 3: Category Selection
**File:** `src/components/onboarding/step3-category.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { updateBusinessCategory } from "@/app/actions/onboarding";

const CATEGORIES = [
  { value: "restaurant", label: "🍔 Restaurant" },
  { value: "coffee", label: "☕ Coffee Shop" },
  { value: "salon", label: "✂️ Salon / Barber" },
  { value: "dental", label: "🦷 Dental" },
  { value: "gym", label: "💪 Gym / Fitness" },
  { value: "spa", label: "🧖 Spa / Wellness" },
  { value: "hotel", label: "🏨 Hotel / Lodging" },
  { value: "retail", label: "🛍️ Retail Store" },
  { value: "automotive", label: "🚗 Automotive" },
  { value: "healthcare", label: "⚕️ Healthcare" },
  { value: "other", label: "📋 Other" }
];

interface Step3Props {
  businessId: string;
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Category({ businessId, onNext, onBack }: Step3Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleNext = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateBusinessCategory(businessId, selectedCategory);
      
      if (!result.success) {
        toast.error(result.error || "Failed to update category");
        return;
      }

      toast.success("Category selected!");
      onNext();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">What type of business?</h2>
        <p className="text-gray-600 mt-1">
          Select your business category to customize your experience
        </p>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`p-4 rounded-lg border-2 transition ${
              selectedCategory === cat.value
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-lg">{cat.label}</p>
          </button>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={submitting}
          className="flex-1"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          disabled={!selectedCategory || submitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
```

---

#### Step 4: Notifications + Confetti
**File:** `src/components/onboarding/step4-notifications.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { createNotificationPreferences } from "@/app/actions/onboarding";

const step4Schema = z.object({
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  phone: z
    .string()
    .regex(/^[\d\-\+\(\)\ ]*$/, "Invalid phone number")
    .optional()
});

type Step4FormData = z.infer<typeof step4Schema>;

interface Step4Props {
  businessId: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function Step4Notifications({ businessId, onComplete, onBack }: Step4Props) {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid }
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    mode: "onChange",
    defaultValues: {
      emailAlerts: true,
      smsAlerts: false,
      phone: ""
    }
  });

  const smsAlerts = watch("smsAlerts");

  const onSubmit = async (data: Step4FormData) => {
    setSubmitting(true);
    try {
      const result = await createNotificationPreferences(businessId, data);
      
      if (!result.success) {
        toast.error(result.error || "Failed to save preferences");
        return;
      }

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setCompleted(true);
      toast.success("🎉 All set! Welcome to Zyene Reviews!");
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">You're all set! 🎉</h2>
          <p className="text-gray-600 mt-2">
            Your organization, business, and settings are ready to go.
          </p>
        </div>
        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Set up notifications</h2>
        <p className="text-gray-600 mt-1">
          How would you like to be notified about new reviews?
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Alerts */}
        <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
          <input
            type="checkbox"
            id="emailAlerts"
            {...register("emailAlerts")}
            className="w-5 h-5 text-blue-600 mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="emailAlerts" className="text-sm font-medium text-gray-900 cursor-pointer">
              Email Alerts
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Get notified when new reviews are posted
            </p>
          </div>
        </div>

        {/* SMS Alerts */}
        <div className="space-y-3">
          <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              id="smsAlerts"
              {...register("smsAlerts")}
              className="w-5 h-5 text-blue-600 mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="smsAlerts" className="text-sm font-medium text-gray-900 cursor-pointer">
                SMS Alerts
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Get text messages for urgent reviews
              </p>
            </div>
          </div>

          {/* Phone Input (appears if SMS enabled) */}
          {smsAlerts && (
            <div className="pl-9">
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                disabled={submitting}
                {...register("phone")}
                className="mt-1"
              />
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-900">What you get:</p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1">
            <li>✓ Real-time review notifications</li>
            <li>✓ AI-powered reply suggestions</li>
            <li>✓ Review sentiment analysis</li>
            <li>✓ Team collaboration tools</li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={submitting}
            className="flex-1"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                Complete Setup
                <CheckCircle2 className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

### PHASE 3: Main Onboarding Page

**File:** `src/app/(onboarding)/page.tsx`

```typescript
"use client";

import { useState } from "react";
import Step1Organization from "@/components/onboarding/step1-organization";
import Step2Business from "@/components/onboarding/step2-business";
import Step3Category from "@/components/onboarding/step3-category";
import Step4Notifications from "@/components/onboarding/step4-notifications";
import ProgressIndicator from "@/components/onboarding/progress-indicator";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [organizationId, setOrganizationId] = useState<string>("");
  const [businessId, setBusinessId] = useState<string>("");

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentStep={step} totalSteps={4} />

        {/* Step 1: Organization */}
        {step === 1 && (
          <Step1Organization
            onNext={(data) => {
              setOrganizationId(data.organizationId);
              setStep(2);
            }}
          />
        )}

        {/* Step 2: Business + Location */}
        {step === 2 && (
          <Step2Business
            organizationId={organizationId}
            onNext={(data) => {
              setBusinessId(data.businessId);
              setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {/* Step 3: Category */}
        {step === 3 && (
          <Step3Category
            businessId={businessId}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}

        {/* Step 4: Notifications */}
        {step === 4 && (
          <Step4Notifications
            businessId={businessId}
            onComplete={() => {
              // Dashboard redirect happens in component
            }}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}
```

---

### PHASE 4: Server Actions

**File:** `src/app/actions/onboarding.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";

// Step 1: Create Organization
export async function createOrganization(name: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create organization
    const { data: org, error } = await supabase
      .from("organizations")
      .insert({
        name,
        slug,
        type: "business",
        plan: "none"
      })
      .select()
      .single();

    if (error || !org) {
      return { success: false, error: "Failed to create organization" };
    }

    // Add user as owner
    await supabase.from("organization_members").insert({
      organization_id: org.id,
      user_id: user.id,
      role: "owner"
    });

    return { success: true, organization: org };
  } catch (error) {
    return { success: false, error: "Unexpected error" };
  }
}

// Step 2: Create Business with Location
export async function createBusinessWithLocation(
  organizationId: string,
  data: {
    businessName: string;
    locationName: string;
    address: string;
    city: string;
    state: string;
    phone?: string;
  }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const slug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create business
    const { data: business, error: bError } = await supabase
      .from("businesses")
      .insert({
        organization_id: organizationId,
        name: data.businessName,
        slug,
        city: data.city
      })
      .select()
      .single();

    if (bError || !business) {
      return { success: false, error: "Failed to create business" };
    }

    // Create location
    const locSlug = data.locationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const { data: location, error: lError } = await supabase
      .from("locations")
      .insert({
        business_id: business.id,
        name: data.locationName,
        address: data.address,
        city: data.city,
        state: data.state.toUpperCase(),
        phone: data.phone || null,
        slug: locSlug,
        is_primary: true
      })
      .select()
      .single();

    if (lError || !location) {
      return { success: false, error: "Failed to create location" };
    }

    return { success: true, business };
  } catch (error) {
    return { success: false, error: "Unexpected error" };
  }
}

// Step 3: Update Category
export async function updateBusinessCategory(businessId: string, category: string) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("businesses")
      .update({ category })
      .eq("id", businessId);

    if (error) {
      return { success: false, error: "Failed to update category" };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Unexpected error" };
  }
}

// Step 4: Create Notification Preferences
export async function createNotificationPreferences(
  businessId: string,
  data: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    phone?: string;
  }
) {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("notification_preferences")
      .insert({
        business_id: businessId,
        email_alerts: data.emailAlerts,
        sms_alerts: data.smsAlerts,
        phone: data.phone || null
      });

    if (error) {
      return { success: false, error: "Failed to save preferences" };
    }

    // Mark onboarding as completed
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("users")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: "Unexpected error" };
  }
}
```

---

### PHASE 5: Auth Redirect

**File:** `src/app/api/auth/callback/route.ts` (UPDATE)

```typescript
// After successful signup, redirect to onboarding
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed onboarding
      const { data: userData } = await supabase.auth.getUser();
      
      // Redirect to onboarding instead of dashboard
      return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
}
```

---

## IMPLEMENTATION CHECKLIST

```
Database:
☐ Verify locations table exists
☐ Verify notification_preferences table exists
☐ Verify review_platforms table exists
☐ All RLS policies in place

Backend (Server Actions):
☐ createOrganization()
☐ createBusinessWithLocation()
☐ updateBusinessCategory()
☐ createNotificationPreferences()
☐ createBusinessFromGoogle() [for Google OAuth]

Frontend Components:
☐ Step1Organization.tsx
☐ Step2Business.tsx (with manual + Google modes)
☐ Step3Category.tsx
☐ Step4Notifications.tsx
☐ ProgressIndicator.tsx
☐ OnboardingPage.tsx

Integration:
☐ Auth callback redirects to /onboarding
☐ Step 4 redirects to /dashboard
☐ All toast notifications working
☐ Confetti animation working
☐ Form validation working

Testing:
☐ Test organization creation
☐ Test business creation with location
☐ Test category selection
☐ Test notifications preferences
☐ Test complete flow end-to-end
☐ Test Google OAuth flow (if implementing)
☐ Test mobile responsiveness
```

---

## NEXT STEPS

1. **Verify Database** → Check if locations table exists
2. **Create Migrations** → Add any missing tables/columns
3. **Implement Server Actions** → Phase 4
4. **Build Components** → Phase 2
5. **Create Onboarding Page** → Phase 3
6. **Update Auth Callback** → Phase 5
7. **Test Complete Flow** → End-to-end testing
8. **Deploy to Staging** → Test with real users
9. **Deploy to Production** → Go live!

---

## TIMELINE

- **Day 1:** Database verification + Server actions
- **Day 2:** Component development (Steps 1-4)
- **Day 3:** Integration + testing + deployment

**Estimated effort:** 2-3 days (full-stack developer)

---

Ready to start? Which phase would you like to begin with?
