export function updateCount(
  count: number,
  action: "increment" | "reset",
): number {
  return action === "reset" ? 0 : count + 1;
}
