import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { _electron as electron } from "playwright-core";

// Set APP_EXECUTABLE to exercise a packaged app instead of the development build.
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
const app = await electron.launch({
  env,
  ...(process.env.APP_EXECUTABLE
    ? { executablePath: process.env.APP_EXECUTABLE }
    : { args: ["."] }),
  timeout: 30_000,
});

try {
  const window = await app.firstWindow();
  window.setDefaultTimeout(10_000);
  await window.getByRole("heading", { name: "Hello, desktop." }).waitFor();
  const count = window.getByRole("status", { name: "Count" });
  assert.equal(await count.textContent(), "0");
  await window.getByRole("button", { name: "Increment", exact: true }).click();
  await window.waitForFunction(
    () => document.querySelector("#count").value === "1",
  );
  assert.equal(await count.textContent(), "1");
  await mkdir("test-results", { recursive: true });
  await window.screenshot({ path: "test-results/desktop.png" });
  await window.getByRole("button", { name: "Reset", exact: true }).click();
  await window.waitForFunction(
    () => document.querySelector("#count").value === "0",
  );
  assert.equal(await count.textContent(), "0");
  assert.equal(await window.evaluate(() => typeof window.require), "undefined");
  console.log(
    "Electron smoke test passed: window opened, increment and reset worked.",
  );
} finally {
  await app.close();
}
