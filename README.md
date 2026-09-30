# Kiosk-Slideshow (React + Electron)

Vollständig offline laufende Endlos-Slideshow für Hochformat-Displays. Keine Interaktion, Start → Slideshow läuft.

## Befehle
| Befehl | Zweck |
|---|---|
| `npm install` | Abhängigkeiten installieren |
| `npm run dev` | Entwicklung (Vite + Electron im Fenster) |
| `npm start` | Build + Start im Kiosk-Modus (Vollbild) |
| `npm run dist:win` | Windows-Installer (auf Windows bauen) → `release/` |
| `npm run dist:mac` | macOS-App/DMG (auf macOS bauen) → `release/` |

Beenden im Kiosk: **Strg/Cmd + Shift + Q** (oder Alt+F4 unter Windows).

## Inhalte austauschen
1. Dateien nach `public/slides/` legen.
2. `src/config/slides.js` anpassen (Reihenfolge, `type: "image" | "video"`, optional `duration` in ms pro Bild).
3. Neu bauen (`npm run dist:win` / `dist:mac`).

Allgemeine Einstellungen (Anzeigedauer, Fade, `objectFit`, Hintergrund, Ton, Pagination) stehen in `src/config/settings.js`.
Dummy-Inhalte (5 Bilder, 20 s Testvideo) erzeugt `scripts/generate-dummy-content.py`.

## Verhalten
- Bilder: Standarddauer 8 s; Videos starten bei 0:00, ohne Controls, und laufen bis `ended`.
- Crossfade bei jedem Wechsel, auch letzte → erste Slide.
- Defekte Bild-/Videodatei blockiert die Schleife nicht (Bild: Timer läuft weiter, Video: Sprung nach 2 s).
- Electron: Kiosk-Vollbild, Autoplay ohne Geste, Display-Sleep-Sperre, Single-Instance, Auto-Reload bei Renderer-Absturz.

## PDF als Quelle – Empfehlung
**Einmalig beim Import in Bilder konvertieren**, nicht zur Laufzeit rendern: robuster, schneller, kein PDF-Engine im Kiosk.

```bash
# Poppler (macOS: brew install poppler, Windows: poppler-Release)
pdftoppm -jpeg -jpegopt quality=90 -scale-to-x 1080 -scale-to-y -1 input.pdf public/slides/page
# erzeugt page-01.jpg, page-02.jpg, ...
```
Die Seiten dann als normale `{ type: "image", src: "slides/page-01.jpg" }`-Einträge eintragen – die Slideshow kennt nur dieses eine Slide-Modell.
Für ein 4K-Hochformat-Display statt 1080 entsprechend höher skalieren (z. B. `-scale-to-x 2160`).

## Hinweis
Die Electron-Builds wurden in dieser Umgebung nicht erzeugt (Windows-Installer/macOS-App müssen auf der jeweiligen Plattform gebaut werden). Der Ablauf wurde im Browser getestet.
