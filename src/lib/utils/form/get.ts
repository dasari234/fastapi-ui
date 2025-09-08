import { Path, PathValue } from "./types";

export function get<T, P extends Path<T>>(obj: T, path: P): PathValue<T, P> | undefined {
  if (!path) return undefined;
  const keys = path.split('.');
  let result: any = obj;

  for (const key of keys) {
    if (result === undefined || result === null) return undefined;
    if (Array.isArray(result) && !isNaN(Number(key))) {
      result = result[Number(key)];
    } else {
      result = result[key];
    }
  }

  return result;
}