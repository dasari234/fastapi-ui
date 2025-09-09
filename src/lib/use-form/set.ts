import type { Path, PathValue } from "./types";

export function set<T, P extends Path<T>>(
  obj: T,
  path: P,
  value: PathValue<T, P>
): T {
  const keys = path.split(".");
  const newObj = (Array.isArray(obj) ? [...obj] : { ...obj }) as T;

  // allow both object and array indexing
  let current: Record<string, unknown> | unknown[] = newObj as
    | Record<string, unknown>
    | unknown[];

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const arrayIndex = !isNaN(Number(nextKey)) ? Number(nextKey) : NaN;

    if (
      (current as Record<string, unknown>)[key] === undefined ||
      (current as Record<string, unknown>)[key] === null
    ) {
      (current as Record<string, unknown>)[key] = !isNaN(arrayIndex) ? [] : {};
    }
    const val = (current as Record<string, unknown>)[key];

    if (!isNaN(arrayIndex)) {
      if (!Array.isArray(val)) {
        (current as Record<string, unknown>)[key] = [];
      }
      if (
        (current as Record<string, unknown>)[key] &&
        (current as unknown[])[arrayIndex] === undefined
      ) {
        (current as unknown[])[arrayIndex] = {};
      }
    } else {
      if (Array.isArray(val)) {
        (current as Record<string, unknown>)[key] = [...val];
      } else if (val && typeof val === "object") {
        (current as Record<string, unknown>)[key] = { ...val };
      }
    }

    current = (current as Record<string, unknown>)[key] as
      | Record<string, unknown>
      | unknown[];
  }

  const lastKey = keys[keys.length - 1];
  if (Array.isArray(current) && !isNaN(Number(lastKey))) {
    (current as unknown[])[Number(lastKey)] = value;
  } else {
    (current as Record<string, unknown>)[lastKey] = value;
  }

  return newObj;
}
