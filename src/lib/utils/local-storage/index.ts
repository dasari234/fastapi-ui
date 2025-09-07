export const localStorageKeys = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  user: "user",
  isAuthenticated: "isAuthenticated",
  session: "session",
} as const;

type LocalStorageKey = keyof typeof localStorageKeys;

const isBrowser =
  typeof window !== "undefined" && typeof localStorage !== "undefined";

// Browser-safe base64 encode/decode
const encode = (value: string): string => {
  try {
    return btoa(encodeURIComponent(value));
  } catch (error) {
    console.error("Encoding failed:", error);
    return "";
  }
};

const decode = (value: string): string | null => {
  try {
    return decodeURIComponent(atob(value));
  } catch (error) {
    console.error("Decoding failed:", error);
    return null;
  }
};

// Optional: warn if value is very large (default: 500KB)
const warnIfLarge = (
  key: LocalStorageKey,
  encodedValue: string,
  maxSizeInKB = 500
) => {
  const sizeKB = encodedValue.length / 1024;
  if (sizeKB > maxSizeInKB) {
    console.warn(
      `[localStorage] Warning: Value for key "${key}" is large (${sizeKB.toFixed(
        2
      )}KB)`
    );
  }
};

export const setLocalStorage = (key: LocalStorageKey, value: string): void => {
  if (!isBrowser) return;
  try {
    const encoded = encode(value);
    warnIfLarge(key, encoded);
    localStorage.setItem(localStorageKeys[key], encoded);
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

export const getLocalStorage = <T>(
  key: LocalStorageKey,
  fallback: T | null = null
): T | null => {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(localStorageKeys[key]);
    if (!raw) return fallback;

    const decoded = decode(raw);
    if (decoded === null) return fallback;
    try {
      return JSON.parse(decoded) as T;
    } catch {
      // If value is not JSON, return as string if T is string, else fallback
      return (decoded as unknown as T) ?? fallback;
    }
  } catch (error) {
    console.error(`Failed to get or decode localStorage key "${key}":`, error);
    return fallback;
  }
};

export const removeLocalStorage = (key: LocalStorageKey): void => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(localStorageKeys[key]);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
};

export const clearAppLocalStorage = (): void => {
  if (!isBrowser) return;
  try {
    Object.values(localStorageKeys).forEach((key) =>
      localStorage.removeItem(key)
    );
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};
