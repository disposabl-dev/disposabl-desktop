import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

for (const options of [
  {
    entrypoints: ["src/main.ts"],
    target: "node",
    format: "cjs",
    naming: "main.cjs",
  },
  {
    entrypoints: ["src/renderer.ts"],
    target: "browser",
    format: "iife",
    naming: "renderer.js",
  },
] as const) {
  const result = await Bun.build({
    ...options,
    entrypoints: [...options.entrypoints],
    outdir: "dist",
    external: ["electron"],
  });
  if (!result.success) throw new AggregateError(result.logs, "Build failed");
}

await cp("src/index.html", "dist/index.html");
await cp("src/styles.css", "dist/styles.css");
