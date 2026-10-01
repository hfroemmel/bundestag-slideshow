const { contextBridge, ipcRenderer } = require("electron");

// Einzige Schnittstelle zum Renderer: die geladene Konfiguration (read-only).
contextBridge.exposeInMainWorld("kiosk", {
  getConfig: () => ipcRenderer.invoke("config:get"),
});
