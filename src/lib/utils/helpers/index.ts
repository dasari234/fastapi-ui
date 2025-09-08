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

export function formatDateTime(dateString?: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,  
  }).replace(",", "");
}


export function getInitials(fullName: string | null | undefined): string {
  if (!fullName) return "";

  const names = fullName.trim().split(" ");
  const first = names[0]?.[0] || "";
  const last = names.length > 1 ? names[names.length - 1][0] : "";

  return (first + last).toUpperCase();
}


export const buildUrlWithParams = (baseUrl: string, params: Record<string, string | number | undefined>): string => {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.append(key, value.toString());
    }
  });
  
  return `${baseUrl}?${urlParams.toString()}`;
};

//Downloads a file from a given URL

export async function downloadFile(url: string, filename?: string) {
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error("Failed to download file");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename || url.split("/").pop() || "download";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
}
