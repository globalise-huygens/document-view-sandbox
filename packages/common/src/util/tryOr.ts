/**
 * Call {@link fn}.
 * When it throws, return the {@link defaultValue}.
 */
export function tryOr<T>(
  fn: () => T,
  defaultValue?: T
): T | undefined {
  try {
    return fn();
  } catch {
    return defaultValue;
  }
}