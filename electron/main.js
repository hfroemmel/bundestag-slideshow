const { app, BrowserWindow, powerSaveBlocker, Menu } = require("electron");
const path = require("path");

const isDev = !!process.env.ELECTRON_DEV;

// Videos müssen ohne Benutzerinteraktion starten dürfen.
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

// Nur eine Instanz zulassen.
if (!app.requestSingleInstanceLock()) app.quit();

let win;

function createWindow() {
  win = new BrowserWindow({
    backgroundColor: "#000000",
    fullscreen: !isDev,
    kiosk: !isDev,
    frame: isDev,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      devTools: isDev,
    },
  });

  win.setMenuBarVisibility(false);
  win.once("ready-to-show", () => win.show());

  // Kein Zoom, keine Navigation weg von der App, keine neuen Fenster.
  win.webContents.setZoomFactor(1);
  win.webContents.on("will-navigate", (e) => e.preventDefault());
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  // Wartungs-Ausgang: Strg/Cmd + Shift + Q beendet die App.
  win.webContents.on("before-input-event", (event, input) => {
    const quit = (input.control || input.meta) && input.shift && input.key.toLowerCase() === "q";
    if (input.type === "keyDown" && quit) app.quit();
  });

  // Selbstheilung: Bei Renderer-Absturz neu laden.
  win.webContents.on("render-process-gone", () => setTimeout(() => win.reload(), 1000));
  win.webContents.on("did-fail-load", () => setTimeout(() => win.reload(), 2000));

  if (isDev) win.loadURL("http://localhost:5173");
  else win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  powerSaveBlocker.start("prevent-display-sleep"); // Bildschirm nicht abdunkeln
  createWindow();
  app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on("second-instance", () => win && win.focus());
app.on("window-all-closed", () => app.quit());
