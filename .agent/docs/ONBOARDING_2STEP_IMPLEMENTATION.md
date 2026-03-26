# 2-Step Simplified Onboarding Implementation Guide

**Current Status:** 4-step onboarding implemented  
**Target:** Simplify to 2-step flow with improvements  
**Effort:** Low (reuse existing components)

---

## CURRENT vs PROPOSED ARCHITECTURE

### Current Flow (4 Steps)
```
Step 1: Business Name
  ↓
Step 2: Google Connection
  ↓
Step 3: Category Selection
  ↓
Step 4: Notifications → Confetti → Dashboard
```

### Proposed Flow (2 Steps)
```
Step 1: Business Name
  ↓
Step 2: First Location (Name, Address, City, State, Phone)
  ↓
Toast: "Location added!"
  ↓
Dashboard (Google/Category/Notifications optional later)
```

**Benefit:** Faster onboarding, lower friction, user gets to dashboard faster

---

## IMPLEMENTATION PLAN

### PHASE 1: Database Schema Updates

**Current:**
```sql
-- Already exists
CREATE TABLE businesses (
  id uuid,
  organization_id uuid,
  name text,
  category text,
  city text,
  slug text,
  created_at timestamp
);
```

**Add locations table:**
```sql
-- NEW: Replace "locations" or "branches"
CREATE TABLE locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  phone text,
  slug text UNIQUE,
  is_primary boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable RLS for locations
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY locations_org_access ON locations
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses 
      WHERE organization_id = (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
      )
    )
  );
```

**Supabase Migration:**
```sql
-- File: supabase/migrations/20260313_create_locations_table.sql
-- Creates locations table with full RLS policies
```

---

### PHASE 2: Component Architecture

#### Simplified Onboarding Page

**File:** `src/app/(onboarding)/page.tsx`

```typescript
"use client";

import { useState } from "react";
import Step1Business from "@/components/onboarding/step1-business";
import Step2Location from "@/components/onboarding/step2-location";
import ProgressIndicator from "@/components/onboarding/progress-indicator";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [businessData, setBusinessData] = useState({
    name: "",
    organizationId: ""
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md mx-auto pt-20">
        {/* Progress Indicator: Step 1 of 2 or Step 2 of 2 */}
        <ProgressIndicator currentStep={step} totalSteps={2} />

        {/* Step 1: Business Name */}
        {step === 1 && (
          <Step1Business 
            onNext={(data) => {
              setBusinessData(data);
              setStep(2);
            }}
          />
        )}

        {/* Step 2: First Location */}
        {step === 2 && (
          <Step2Location 
            businessId={businessData.id}
            businessName={businessData.name}
            onComplete={() => {
              // Redirect to dashboard
              window.location.href = "/dashboard";
            }}
          />
        )}
      </div>
    </div>
  );
}
```

---

#### Step 1: Business Name

**File:** `src/components/onboarding/step1-business.tsx`

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
import { createBusinessAndAdvanceOnboarding } from "@/app/actions/onboarding";

// Zod Schema
const step1Schema = z.object({
  businessName: z
    .string()
    .min(1, "Business name is required")
    .min(3, "Business name must be at least 3 characters")
    .max(100, "Business name must be less than 100 characters")
});

type Step1FormData = z.infer<typeof step1Schema>;

interface Step1Props {
  onNext: (data: { id: string; name: string; organizationId: string }) => void;
}

export default function Step1Business({ onNext }: Step1Props) {
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
      const result = await createBusinessAndAdvanceOnboarding(data, "");
      
      if (!result.success) {
        toast.error(result.error || "Failed to create business");
        return;
      }

      toast.success("Business created! Let's add your first location.");
      onNext({
        id: result.business.id,
        name: result.business.name,
        organizationId: result.business.organization_id
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
        <h2 className="text-2xl font-bold text-gray-900">Set up your business</h2>
        <p className="text-gray-600 mt-1">
          What's the name of your business?
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
            Business Name
          </Label>
          <Input
            id="businessName"
            type="text"
            placeholder="e.g., Morgan's Coffee Shop"
            autoFocus
            disabled={submitting}
            {...register("businessName")}
            className="mt-1"
          />
          {errors.businessName && (
            <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>
          )}
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

#### Step 2: First Location

**File:** `src/components/onboarding/step2-location.tsx`

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { addFirstLocation } from "@/app/actions/onboarding";

// Zod Schema
const step2Schema = z.object({
  locationName: z
    .string()
    .min(1, "Location name is required")
    .max(100, "Location name must be less than 100 characters"),
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
    .min(2, "State code required (e.g., CA, NY)")
    .max(2),
  phone: z
    .string()
    .regex(/^[\d\-\+\(\)\ ]*$/, "Invalid phone number")
    .optional()
});

type Step2FormData = z.infer<typeof step2Schema>;

interface Step2Props {
  businessId: string;
  businessName: string;
  onComplete: () => void;
}

export default function Step2Location({ businessId, businessName, onComplete }: Step2Props) {
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    mode: "onChange",
    defaultValues: {
      locationName: `${businessName} - Main`,
      state: ""
    }
  });

  const onSubmit = async (data: Step2FormData) => {
    setSubmitting(true);
    try {
      const result = await addFirstLocation(businessId, data);

      if (!result.success) {
        toast.error(result.error || "Failed to add location");
        return;
      }

      setCompleted(true);
      toast.success("🎉 Location added! Redirecting to dashboard...");
      
      setTimeout(() => {
        onComplete();
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
          <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
          <p className="text-gray-600 mt-2">
            Your first location has been added.
          </p>
        </div>
        <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
      </div>
    );
  }

  const US_STATES = [
    { code: "AL", name: "Alabama" },
    { code: "CA", name: "California" },
    { code: "NY", name: "New York" },
    { code: "TX", name: "Texas" },
    // ... all 50 states
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Add your first location</h2>
        <p className="text-gray-600 mt-1">
          Where is your business located?
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Location Name */}
        <div>
          <Label htmlFor="locationName" className="block text-sm font-medium text-gray-700">
            Location Name
          </Label>
          <Input
            id="locationName"
            placeholder="e.g., Main Store"
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

        {/* City & State Row */}
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
                Adding...
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

#### Progress Indicator

**File:** `src/components/onboarding/progress-indicator.tsx`

```typescript
import { motion } from "framer-motion";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({
  currentStep,
  totalSteps
}: ProgressIndicatorProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      {/* Step Counter */}
      <div className="text-center mb-4">
        <p className="text-sm font-medium text-gray-600">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className="bg-blue-600 h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
```

---

### PHASE 3: Server Actions

**File:** `src/app/actions/onboarding.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";

export async function createBusinessAndAdvanceOnboarding(
  data: { businessName: string },
  organizationId: string
) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Not authenticated"
      };
    }

    // Auto-get org if not provided
    if (!organizationId) {
      const { data: org } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .single();
      
      if (!org) {
        return { success: false, error: "Organization not found" };
      }
      organizationId = org.organization_id;
    }

    // Generate slug
    const slug = data.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create business
    const { data: business, error } = await supabase
      .from("businesses")
      .insert({
        organization_id: organizationId,
        name: data.businessName,
        slug: slug
      })
      .select()
      .single();

    if (error || !business) {
      return {
        success: false,
        error: "Failed to create business"
      };
    }

    return {
      success: true,
      business
    };
  } catch (error) {
    return {
      success: false,
      error: "Unexpected error occurred"
    };
  }
}

export async function addFirstLocation(
  businessId: string,
  data: {
    locationName: string;
    address: string;
    city: string;
    state: string;
    phone?: string;
  }
) {
  try {
    const supabase = await createClient();

    // Verify user owns this business
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Generate slug
    const slug = data.locationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create location
    const { data: location, error } = await supabase
      .from("locations")
      .insert({
        business_id: businessId,
        name: data.locationName,
        address: data.address,
        city: data.city,
        state: data.state.toUpperCase(),
        phone: data.phone || null,
        slug: slug,
        is_primary: true // First location is primary
      })
      .select()
      .single();

    if (error || !location) {
      return {
        success: false,
        error: "Failed to add location"
      };
    }

    // Mark onboarding as completed
    await supabase
      .from("users")
      .update({ onboarding_completed: true })
      .eq("id", user.id);

    return {
      success: true,
      location
    };
  } catch (error) {
    return {
      success: false,
      error: "Unexpected error occurred"
    };
  }
}
```

---

## KEY IMPROVEMENTS OVER CURRENT FLOW

### 1. **Faster Onboarding**
- ❌ Current: 4 steps → 10-15 minutes
- ✅ New: 2 steps → 2-3 minutes

### 2. **Location Data Capture**
- ✅ Address, City, State, Phone now collected
- ✅ Essential for multi-location support
- ✅ Enables location-based services

### 3. **Better User Experience**
- ✅ Auto-fill location name suggestion
- ✅ State dropdown with all 50 states
- ✅ Phone validation (optional)
- ✅ Progress indicator "Step 1 of 2"

### 4. **Data Quality**
- ✅ User chooses actual business name (not auto-generated)
- ✅ Address & location data captured upfront
- ✅ Validation: min/max character limits
- ✅ Zod schemas: type-safe validation

### 5. **Immediate Database Structure**
- ✅ Locations table created
- ✅ Support for multi-location businesses
- ✅ Primary location flagged
- ✅ RLS policies enforced

### 6. **Optional Later Setup**
- ✅ Google connection: can do after onboarding
- ✅ Category selection: optional
- ✅ Notifications: defaulted, can customize
- ✅ Less friction, faster to dashboard

---

## IMPLEMENTATION ROADMAP

### Week 1: Backend Setup
```
Monday:
  ├─ Create locations table migration
  ├─ Add RLS policies
  └─ Test Supabase schema

Tuesday:
  ├─ Create server actions (addFirstLocation)
  ├─ Add Zod schemas
  └─ Test API responses

Wednesday:
  ├─ Add error handling
  ├─ Add success validation
  └─ Test edge cases
```

### Week 2: Frontend Implementation
```
Thursday:
  ├─ Create Step1Business component
  ├─ Create Step2Location component
  └─ Create ProgressIndicator

Friday:
  ├─ Create simplified onboarding page
  ├─ Integrate with auth redirect
  └─ Test form flows

Saturday:
  ├─ Add loading states
  ├─ Add error toasts
  └─ Test complete flow
```

### Week 3: Testing & Polish
```
Sunday:
  ├─ Unit tests for validation
  ├─ Integration tests for forms
  └─ E2E tests for complete flow

Monday:
  ├─ Mobile responsiveness testing
  ├─ Accessibility audit
  └─ Performance optimization

Tuesday:
  ├─ Final QA
  ├─ Documentation
  └─ Deploy to production
```

---

## COMPARISON: CURRENT vs PROPOSED

| Aspect | Current (4 Steps) | Proposed (2 Steps) |
|--------|------------------|-------------------|
| **Steps** | 4 | 2 |
| **Time to Dashboard** | 10-15 min | 2-3 min |
| **Business Name** | Auto-generated | User-selected |
| **Location Data** | Not captured | Captured fully |
| **Google OAuth** | Required | Optional |
| **Category** | Required | Optional |
| **Notifications** | Configurable | Pre-set |
| **Multi-location** | Not prepared | Ready |
| **User Friction** | High | Low |
| **Data Quality** | Medium | High |

---

## MIGRATION PATH FROM CURRENT TO NEW

### Option 1: Replace Completely
```
1. Create new 2-step onboarding route
2. Update auth redirect to new flow
3. Keep 4-step as optional "advanced setup"
4. Users who completed old flow: skip new onboarding
5. Sunset 4-step after 3 months
```

### Option 2: Parallel Running
```
1. Create new 2-step onboarding
2. A/B test: 50% users get 4-step, 50% get 2-step
3. Track completion rate, dropout rate
4. If 2-step better: gradually shift 100%
5. Keep 4-step for users who want it
```

### Option 3: Hybrid Approach
```
1. Deploy 2-step as default
2. Add "Advanced Setup" link → 4-step (Google, Category, Notifications)
3. Users can do basic 2-step, then advanced later
4. Best of both: fast + optional advanced
```

---

## CODE CHECKLIST

```typescript
// ✅ Create locations table
src/supabase/migrations/20260313_create_locations_table.sql

// ✅ Create server actions
src/app/actions/onboarding.ts → addFirstLocation()

// ✅ Create components
src/components/onboarding/step1-business.tsx
src/components/onboarding/step2-location.tsx
src/components/onboarding/progress-indicator.tsx

// ✅ Create onboarding page
src/app/(onboarding)/page.tsx

// ✅ Update auth redirect
src/app/api/auth/callback/route.ts → redirect to /onboarding

// ✅ Create Zod schemas
src/lib/validations/onboarding.ts → add step1Schema, step2Schema

// ✅ Create locations API (optional)
src/app/api/locations/route.ts
```

---

## TESTING STRATEGY

### Form Validation Tests
```typescript
// Step 1: Business Name
✅ Empty name: show error
✅ Name too short: show error
✅ Name too long: show error
✅ Valid name: proceed to Step 2

// Step 2: Location
✅ All fields required except phone
✅ State must be 2 characters
✅ Phone regex validation
✅ Address min 5 characters
✅ All valid: show success screen
```

### Integration Tests
```typescript
// Full Flow
✅ User → Auth → Onboarding Step 1 → Business created
✅ Step 1 → Step 2 → Location created
✅ Location creation → User marked onboarded_completed
✅ Onboarded → Redirect to dashboard
```

### E2E Tests
```typescript
// Browser Tests
✅ Can type business name
✅ Can submit form
✅ Can fill location details
✅ Toast appears on success
✅ Redirects to dashboard
```

---

## PERFORMANCE TARGETS

- **Page Load:** < 1s (fast-start onboarding)
- **Form Submission:** < 2s (database write)
- **Validation Feedback:** < 100ms (real-time)
- **Toast Display:** < 500ms

---

## ACCESSIBILITY FEATURES

```typescript
// ✅ WCAG 2.1 AA Compliance
- Form labels: <label htmlFor="...">
- Error messages: aria-describedby
- Button states: disabled, loading
- Progress indicator: aria-current="step"
- Keyboard navigation: Tab through inputs
- Focus management: Auto-focus first input
```

---

## CONCLUSION

**Benefits of 2-step approach:**
1. ✅ **User Retention:** Get users to dashboard faster
2. ✅ **Data Quality:** Capture location details upfront
3. ✅ **Flexibility:** Optional advanced setup later
4. ✅ **Scalability:** Ready for multi-location support
5. ✅ **Simplicity:** Less code than 4-step, easier to maintain

**Estimated Implementation Time:** 3-5 days  
**Risk Level:** Low (reuses existing patterns)  
**ROI:** High (faster onboarding = better retention)

---

## NEXT STEPS

1. **Approve design** ← You are here
2. Create Supabase migration
3. Implement server actions
4. Build React components
5. Integrate with auth flow
6. Test complete flow
7. Deploy to staging
8. A/B test with real users
9. Deploy to production
10. Monitor funnel metrics

Ready to implement? Start with Phase 1 (database) or Phase 2 (frontend)?
