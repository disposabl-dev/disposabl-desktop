import { app, BrowserWindow, session } from "electron";
import { join } from "node:path";

function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 480,
    minHeight: 420,
    title: "Disposabl Desktop",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  window.webContents.on("will-navigate", (event) => event.preventDefault());
  void window.loadFile(join(app.getAppPath(), "dist", "index.html"));
}

void app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler(
    (_contents, _permission, callback) => {
      callback(false);
    },
  );
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
