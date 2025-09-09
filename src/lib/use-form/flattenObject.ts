export function flattenObject<T extends object>(
  obj: T,
  prefix = ''
): Record<string, unknown> {
  const recordObj = obj as Record<string, unknown>;
  return Object.keys(recordObj).reduce((acc, key) => {
    const value = recordObj[key];
    const pre = prefix.length ? `${prefix}.` : '';

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(acc, flattenObject(value as Record<string, unknown>, pre + key));
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.assign(acc, flattenObject(item as Record<string, unknown>, `${pre}${key}.${index}`));
        } else {
          acc[`${pre}${key}.${index}`] = item;
        }
      });
      acc[pre + key] = value;
    } else {
      acc[pre + key] = value;
    }

    return acc;
  }, {} as Record<string, unknown>);
}