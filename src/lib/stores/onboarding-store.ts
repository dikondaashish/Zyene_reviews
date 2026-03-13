import { create } from "zustand";

export interface OnboardingState {
  currentStep: number;
  businessName: string;
  category: string;
  phone: string;
  googleConnected: boolean;
  // Step 3: Notification preferences
  emailAlerts: boolean;
  emailFrequency: "immediately" | "daily_digest" | "weekly_summary";
  smsAlerts: boolean;
  smsPhoneNumber: string;
  minRatingThreshold: "1" | "2" | "3";
  // Step 4: First review request
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  requestChannel: "email" | "sms" | "both";
  notificationsConfig: {
    email: boolean;
    sms: boolean;
    digest: boolean;
  };
  firstRequestSent: boolean;
  isLoading: boolean;

  // Actions
  setCurrentStep: (step: number) => void;
  setBusinessName: (name: string) => void;
  setCategory: (category: string) => void;
  setPhone: (phone: string) => void;
  setGoogleConnected: (connected: boolean) => void;
  setEmailAlerts: (enabled: boolean) => void;
  setEmailFrequency: (frequency: "immediately" | "daily_digest" | "weekly_summary") => void;
  setSmsAlerts: (enabled: boolean) => void;
  setSmsPhoneNumber: (phone: string) => void;
  setMinRatingThreshold: (threshold: "1" | "2" | "3") => void;
  setRecipientName: (name: string) => void;
  setRecipientEmail: (email: string) => void;
  setRecipientPhone: (phone: string) => void;
  setRequestChannel: (channel: "email" | "sms" | "both") => void;
  setNotificationsConfig: (config: { email?: boolean; sms?: boolean; digest?: boolean }) => void;
  setFirstRequestSent: (sent: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentStep: 1,
  businessName: "",
  category: "",
  phone: "",
  googleConnected: false,
  emailAlerts: true,
  emailFrequency: "daily_digest" as const,
  smsAlerts: false,
  smsPhoneNumber: "",
  minRatingThreshold: "1" as const,
  // Step 4: First review request
  recipientName: "" as string,
  recipientEmail: "" as string,
  recipientPhone: "" as string,
  requestChannel: "email" as "email" | "sms" | "both",
  notificationsConfig: {
    email: true,
    sms: false,
    digest: true,
  },
  firstRequestSent: false,
  isLoading: false,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setCurrentStep: (step: number) => set({ currentStep: step }),
  setBusinessName: (name: string) => set({ businessName: name }),
  setCategory: (category: string) => set({ category: category }),
  setPhone: (phone: string) => set({ phone: phone }),
  setGoogleConnected: (connected: boolean) => set({ googleConnected: connected }),
  setEmailAlerts: (enabled: boolean) => set({ emailAlerts: enabled }),
  setEmailFrequency: (frequency) => set({ emailFrequency: frequency }),
  setSmsAlerts: (enabled: boolean) => set({ smsAlerts: enabled }),
  setSmsPhoneNumber: (phone: string) => set({ smsPhoneNumber: phone }),
  setMinRatingThreshold: (threshold) => set({ minRatingThreshold: threshold }),
  setRecipientName: (name: string) => set({ recipientName: name }),
  setRecipientEmail: (email: string) => set({ recipientEmail: email }),
  setRecipientPhone: (phone: string) => set({ recipientPhone: phone }),
  setRequestChannel: (channel) => set({ requestChannel: channel }),
  setNotificationsConfig: (config) =>
    set((state) => ({
      notificationsConfig: { ...state.notificationsConfig, ...config },
    })),
  setFirstRequestSent: (sent: boolean) => set({ firstRequestSent: sent }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  reset: () => set(initialState),
}));
