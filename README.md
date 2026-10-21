# Disposabl Desktop

A minimal Electron app with a counter. Bun builds the TypeScript and runs type
checks, linting, formatting, and unit tests. Electron runs the desktop app.

## Run locally

Install [Bun canary](https://bun.sh/docs/installation#canary-builds) and Node.js 24.
Node.js is used by Electron's packaging tools and the Playwright smoke test.

```sh
bun upgrade --canary
bun install
bun run dev
```

`dev` builds once and opens the app. Restart it after editing source files.

```sh
bun run validate:check # Native bun lint, bun fmt --check, and bun check
bun run validate       # Fix lint/format issues, then check types
bun run test           # Bun unit tests
bun run build          # Bundle the main process and renderer
bun run test:smoke     # Open the built Electron app and test its buttons
bun run package        # Create installers for the current platform
```

The smoke test opens an actual Electron window, checks increment and reset, and
saves a screenshot in `apps/desktop/test-results/desktop.png`. On a headless Linux
machine, run it with `xvfb-run --auto-servernum bun run test:smoke`.

## Structure

- `apps/desktop/src` contains the Electron main process, HTML, CSS, and renderer.
- `apps/desktop/scripts` contains the Bun build and Electron smoke test.
- `packages/typescript-config` is copied from `disposabl-starter-kit`.
- `bunfig.toml` is the same file used by the starter kit.

The renderer loads local files with a content security policy, sandboxing,
context isolation, and no Node integration. No preload bridge is needed.

## Copy into disposabl-starter-kit

Copy `apps/desktop` into the starter kit's `apps/desktop`, then run `bun install`
from its root. Its existing `apps/*` workspace and
`@disposabl/typescript-config` package already match this app. Keep the starter
kit's root config and lockfile. The app declares its own development dependencies.

```sh
bun run --filter @disposabl/desktop dev
bun run --filter @disposabl/desktop build
bun run --filter @disposabl/desktop package
```

If moving the release workflow too, copy `.github/workflows/release.yml`. Its
root validation commands must pass for the whole starter kit before release.

## Builds and releases

[GitHub Actions](https://github.com/disposabl-dev/disposabl-desktop/actions) uses
`oven-sh/setup-bun` with `bun-version: canary` on every platform.

Pull requests to `main` and pushes to `main` first run type checks, lint,
formatting, unit tests, and Bun bundling once on Ubuntu. That small, portable
bundle is uploaded and reused by three native packaging jobs running in parallel:

- Windows x64 on `windows-2025`, producing an NSIS `.exe` installer.
- Apple Silicon only on `macos-15`, producing an arm64 `.dmg`.
- Ubuntu x64 on `ubuntu-24.04`, producing `.AppImage` and `.deb` packages.

Each job saves a screenshot of the app after clicking Increment. Ubuntu uses
Xvfb for its display. A manual workflow run checks and builds without releasing.

Native jobs install only the desktop workspace's tooling. They cache Bun's
package downloads, Electron archives, and electron-builder tools separately for
each OS and architecture. They package the shared bundle using
`package:bundle`, so they do not rerun checks, tests, or compilation. A fresh
runner still needs to link its own platform-specific tools; `node_modules`
is not transferred between operating systems. Debian packages use Zstandard
compression, and artifact upload skips recompressing finished installers.

After all three jobs pass on a push to `main`, the workflow publishes a
[GitHub release](https://github.com/disposabl-dev/disposabl-desktop/releases)
with all four installers and SHA-256 checksums. A merged PR causes that same
push event. Versions use `0.1.<workflow run number>` so direct pushes also get
unique versions without a version-bump commit or tag from a developer.
Rerunning the same workflow updates that release's assets.

Builds are unsigned. The macOS app is not notarized, so Gatekeeper may block it;
Windows SmartScreen may also show a warning. Signing credentials are not
required by this starter. Automatic in-app updates are not included.

## License

[MIT](LICENSE)
