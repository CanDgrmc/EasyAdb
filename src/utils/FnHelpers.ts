export function execIf<T>(
  condition: boolean,
  fn: Function,
  ...args: any
): T | null {
  if (condition) {
    return fn(...args);
  }
  return null;
}
