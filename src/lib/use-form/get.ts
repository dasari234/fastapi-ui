import type { Path, PathValue } from "./types";

export function get<T, P extends Path<T>>(obj: T, path: P): PathValue<T, P> | undefined {
  if (!path) return undefined;

  const keys = path.split(".");

  let result: unknown = obj;

  for (const key of keys) {
    if (result === undefined || result === null) return undefined;

    if (Array.isArray(result) && !isNaN(Number(key))) {
      result = result[Number(key)];
    } else if (typeof result === "object" && result !== null) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return result as PathValue<T, P>;
}
