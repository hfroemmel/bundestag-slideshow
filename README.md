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
1. Dateien nach `public/slides/` legen (z. B. je Tag ein Ordner `public/slides/2026-10-02/`).
2. `src/config/playlists.js` anpassen: je Veranstaltungstag eine Liste mit `date` (`"JJJJ-MM-TT"`), optional `imageDuration` (Standarddauer der Liste in ms) und `slides` (`type: "image" | "video"`, `src`, optional `duration` in ms pro Bild).
3. Neu bauen (`npm run dist:win` / `dist:mac`).

Bilddauer = `slide.duration` → `liste.imageDuration` → `settings.imageDuration`.
Allgemeine Einstellungen (Fade, `objectFit`, Hintergrund, Ton, Fortschrittsleiste, Hinweistext) stehen in `src/config/settings.js`.
Dummy-Inhalte (je Tag 4 Bilder + 10 s Testvideo) erzeugt `scripts/generate-dummy-content.py`.

## Verhalten
- Die App wählt per **lokalem Systemdatum** automatisch die Liste des Tages (kein Build/Code-Eingriff pro Tag nötig) und spielt sie als Endlosschleife.
- **Datumswechsel bei laufender App**: Der aktuelle Inhalt wird zu Ende gespielt, danach beginnt die Liste des neuen Tages von vorn.
- **Keine Liste für heute**: neutraler Hinweis (`noPlaylistMessage`); sobald eine Liste gilt (z. B. nach Mitternacht), startet sie automatisch. Es werden nie Inhalte anderer Tage gezeigt.
- Bilder: Anzeigedauer wie oben; Videos starten bei 0:00, ohne Controls, und laufen bis `ended`.
- **Fortschrittsleiste** am unteren Rand (überlagert den Inhalt): startet bei 100 % und schrumpft nach links auf 0 %. Bei Videos folgt sie Position/Länge des Videos.
- Crossfade bei jedem Wechsel.
- Defekte Bild-/Videodatei blockiert die Schleife nicht (Bild: Timer läuft weiter, Video: Sprung nach 2 s).
- Electron: Kiosk-Vollbild, Autoplay ohne Geste, Display-Sleep-Sperre, Single-Instance, Auto-Reload bei Renderer-Absturz.

## PDF als Quelle – Empfehlung
**Einmalig beim Import in Bilder konvertieren**, nicht zur Laufzeit rendern: robuster, schneller, kein PDF-Engine im Kiosk.

```bash
# Poppler (macOS: brew install poppler, Windows: poppler-Release)
pdftoppm -jpeg -jpegopt quality=90 -scale-to-x 1080 -scale-to-y -1 input.pdf public/slides/page
# erzeugt page-01.jpg, page-02.jpg, ...
```
Die Seiten dann als normale `{ type: "image", src: "slides/…/page-01.jpg" }`-Einträge in die Liste des jeweiligen Tages eintragen – die Slideshow kennt nur dieses eine Slide-Modell.
Für ein 4K-Hochformat-Display statt 1080 entsprechend höher skalieren (z. B. `-scale-to-x 2160`).

## Hinweis
Die Electron-Builds wurden in dieser Umgebung nicht erzeugt (Windows-Installer/macOS-App müssen auf der jeweiligen Plattform gebaut werden). Der Ablauf wurde im Browser getestet.
