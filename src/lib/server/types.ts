import type { Stage } from "@/lib/content/catalog";

export type Profile = {
  userId: string;
  role: "member" | "admin" | "partner";
  displayName: string | null;
  email: string | null;
  location: string | null;
  timezone: string | null;
  language: string;
  stage: Stage | null;
  dueDate: string | null;
  babyBirthday: string | null;
  previousPregnancies: number;
  isFirstPregnancy: boolean | null;
  isMultiple: boolean;
  householdSize: number;
  weeklyBudget: string | null;
  zipCode: string | null;
  city: string | null;
  locationPermission: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
  themePreference: string;
  notificationPrefs: Record<string, boolean>;
  partnerInviteCode: string | null;
};

export type Dietary = {
  diets: string[];
  allergies: string[];
  avoids: string | null;
  dislikes: string | null;
  loves: string | null;
  cuisines: string[];
};

export type GroceryPrefs = {
  stores: string[];
  customStores: string | null;
};

export type Membership = {
  id: number;
  plan: string;
  status: string;
  priceCents: number;
  startedAt: string;
  expiresAt: string | null;
};

export type BusinessSettings = {
  businessName: string;
  tagline: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
  currency: string;
  timezone: string;
  businessHours: Record<string, string[]>;
  appointmentDurationMinutes: number;
  bufferMinutes: number;
  dailyAppointmentLimit: number;
  zoomDefaultLink: string | null;
  paymentProcessor: string;
  emailNotificationsEnabled: boolean;
  nouriSystemNotes: string | null;
};
