const { app, BrowserWindow, powerSaveBlocker, Menu, dialog, ipcMain, protocol, net } = require("electron");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { loadConfig } = require("./config");

const isDev = !!process.env.ELECTRON_DEV;

// Videos müssen ohne Benutzerinteraktion starten dürfen.
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

// Mediendateien werden über das Schema media:// ausgeliefert (nur Dateien aus der Config).
protocol.registerSchemesAsPrivileged([
  { scheme: "media", privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true, bypassCSP: true } },
]);

// Nur eine Instanz zulassen.
if (!app.requestSingleInstanceLock()) app.quit();

let win;
let rendererConfig = null; // Config für den Renderer (Slides mit media://-URLs)
const mediaFiles = new Map(); // id -> absoluter Pfad (Whitelist)

const MIME = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".avif": "image/avif",
  ".mp4": "video/mp4", ".m4v": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".ogv": "video/ogg",
};

function setActiveConfig(config) {
  const ids = new Map();
  const urlFor = (file) => {
    if (!ids.has(file)) {
      ids.set(file, ids.size);
      mediaFiles.set(String(ids.get(file)), file);
    }
    return `media://f/${ids.get(file)}`;
  };
  rendererConfig = {
    settings: config.settings,
    playlists: config.playlists.map((p) => ({
      date: p.date,
      imageDuration: p.imageDuration,
      slides: p.slides.map((s) => ({ type: s.type, src: urlFor(s.file), duration: s.duration })),
    })),
  };
}

// --config <Datei> bzw. --config=<Datei> überspringt den Dialog (z. B. für Autostart).
// Relative Pfade gelten ab dem Arbeitsordner (bei Verknüpfungen: "Ausführen in").
function configFromArgs() {
  const args = process.argv.slice(1);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--config" && args[i + 1]) return path.resolve(args[i + 1]);
    if (args[i].startsWith("--config=")) return path.resolve(args[i].slice("--config=".length));
  }
  return null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Beim Autostart ist die Config evtl. noch nicht erreichbar (Netzlaufwerk, USB-Stick).
// Daher bis zu 2 Minuten alle 5 s erneut versuchen, bevor der Dialog erscheint.
async function loadConfigWithRetry(file) {
  let result = loadConfig(file);
  for (let i = 0; i < 24 && !result.config && !fs.existsSync(file); i++) {
    await sleep(5000);
    result = loadConfig(file);
  }
  return result;
}

// Fragt per Dialog nach der Config, bis eine gültige gewählt wurde. null = abgebrochen.
async function chooseConfig() {
  let file = configFromArgs();
  for (;;) {
    if (!file) {
      const defaultPath = app.isPackaged ? process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(process.execPath) : process.cwd();
      const res = await dialog.showOpenDialog({
        title: "Konfigurationsdatei der Slideshow wählen",
        defaultPath,
        properties: ["openFile"],
        filters: [{ name: "Konfiguration (JSON)", extensions: ["json"] }, { name: "Alle Dateien", extensions: ["*"] }],
      });
      if (res.canceled || !res.filePaths[0]) return null;
      file = res.filePaths[0];
    }

    const { config, errors, warnings } = await loadConfigWithRetry(file);
    if (!config) {
      await dialog.showMessageBox({
        type: "error",
        title: "Ungültige Konfiguration",
        message: `Die Konfiguration konnte nicht geladen werden:\n${file}`,
        detail: errors.slice(0, 15).join("\n"),
      });
      file = null;
      continue;
    }
    if (warnings.length) {
      const { response } = await dialog.showMessageBox({
        type: "warning",
        title: "Konfiguration geladen – mit Hinweisen",
        message: `${warnings.length} Hinweis(e). Fehlende Dateien werden übersprungen.`,
        detail: warnings.slice(0, 15).join("\n") + (warnings.length > 15 ? "\n…" : ""),
        buttons: ["Trotzdem starten", "Andere Konfiguration wählen"],
        defaultId: 0,
        cancelId: 1,
      });
      if (response === 1) {
        file = null;
        continue;
      }
    }
    return config;
  }
}

function createWindow() {
  win = new BrowserWindow({
    backgroundColor: "#000000",
    fullscreen: !isDev,
    kiosk: !isDev,
    frame: isDev,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
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

  // Selbstheilung: Bei Renderer-Absturz neu laden (Config bleibt im Main-Prozess erhalten).
  win.webContents.on("render-process-gone", () => setTimeout(() => win.reload(), 1000));
  win.webContents.on("did-fail-load", () => setTimeout(() => win.reload(), 2000));

  if (isDev) win.loadURL("http://localhost:5173");
  else win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

app.whenReady().then(async () => {
  Menu.setApplicationMenu(null);

  protocol.handle("media", async (request) => {
    const file = mediaFiles.get(new URL(request.url).pathname.slice(1));
    if (!file) return new Response("Not found", { status: 404 });
    const res = await net.fetch(pathToFileURL(file).toString(), { headers: request.headers });
    const headers = new Headers(res.headers);
    const mime = MIME[path.extname(file).toLowerCase()];
    if (mime) headers.set("Content-Type", mime);
    return new Response(res.body, { status: res.status, headers });
  });

  ipcMain.handle("config:get", () => rendererConfig);

  const config = await chooseConfig();
  if (!config) return app.quit();
  setActiveConfig(config);

  powerSaveBlocker.start("prevent-display-sleep"); // Bildschirm nicht abdunkeln
  createWindow();
  app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on("second-instance", () => win && win.focus());
app.on("window-all-closed", () => app.quit());
