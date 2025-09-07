import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs));
};

export function formatDate(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }
): string {
  if (!dateString) return "";

  const date = typeof dateString === "string" ? new Date(dateString) : dateString as Date;

  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-GB", options);
}


export function getInitials(fullName: string | null | undefined): string {
  if (!fullName) return "";

  const names = fullName.trim().split(" ");
  const first = names[0]?.[0] || "";
  const last = names.length > 1 ? names[names.length - 1][0] : "";

  return (first + last).toUpperCase();
}