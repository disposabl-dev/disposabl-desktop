import { expect, test } from "bun:test";
import { updateCount } from "./counter";

test("each click increments the count", () => {
  expect(updateCount(updateCount(0, "increment"), "increment")).toBe(2);
});

test("reset clears the count and counting can restart", () => {
  const reset = updateCount(12, "reset");
  expect(reset).toBe(0);
  expect(updateCount(reset, "increment")).toBe(1);
});
