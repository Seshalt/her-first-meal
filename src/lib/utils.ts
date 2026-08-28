import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number, currency = "USD") {
  const hasCents = Math.abs(cents) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(cents / 100);
}

export function pregnancyWeekFromDueDate(dueDate: string | null | undefined): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate + "T12:00:00");
  if (Number.isNaN(due.getTime())) return null;
  const now = new Date();
  const msLeft = due.getTime() - now.getTime();
  const daysLeft = Math.round(msLeft / 86400000);
  const week = 40 - Math.floor(daysLeft / 7);
  return Math.min(42, Math.max(1, week));
}

export function postpartumWeekFromBirthday(birthday: string | null | undefined): number | null {
  if (!birthday) return null;
  const born = new Date(birthday + "T12:00:00");
  if (Number.isNaN(born.getTime())) return null;
  const days = Math.floor((Date.now() - born.getTime()) / 86400000);
  if (days < 0) return 0;
  return Math.floor(days / 7);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
