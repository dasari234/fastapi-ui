import { Path, PathValue } from "./types";

export function set<T, P extends Path<T>>(obj: T, path: P, value: PathValue<T, P>): T {
    const keys = path.split('.');
    const newObj = (Array.isArray(obj) ? [...obj] : { ...obj }) as T;
    let current: Record<string, unknown> = newObj as Record<string, unknown>;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const nextKey = keys[i + 1];
        const arrayIndex = !isNaN(Number(nextKey)) ? Number(nextKey) : NaN;

        if (current[key] === undefined || current[key] === null) {
            current[key] = !isNaN(arrayIndex) ? [] : {};
        }

        if (!isNaN(arrayIndex)) {
            if (!Array.isArray(current[key])) {
                current[key] = [];
            }
            if (current[key][arrayIndex] === undefined) {
                current[key][arrayIndex] = {};
            }
        } else {
            if (Array.isArray(current[key])) {
                current[key] = { ...current[key] };
            }
        }

        current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    if (Array.isArray(current) && !isNaN(Number(lastKey))) {
        current[Number(lastKey)] = value;
    } else {
        current[lastKey] = value;
    }

    return newObj;
}
