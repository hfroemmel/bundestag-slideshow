# Kiosk-Slideshow (React + Electron)

Vollständig offline laufende Endlos-Slideshow für Hochformat-Displays. Keine Interaktion, Start → Slideshow läuft.

## Befehle
| Befehl | Zweck |
|---|---|
| `npm install` | Abhängigkeiten installieren |
| `npm run dev` | Entwicklung (Vite + Electron im Fenster, lädt `example/kiosk-config.json`) |
| `npm start` | Build + Start im Kiosk-Modus, Config-Dialog erscheint |
| `npm run start:example` | wie `start`, aber direkt mit der Beispiel-Config |
| `npm run dist:win` | Windows-Installer (auf Windows bauen oder per GitHub Workflow) → `release/` |
| `npm run dist:mac` | macOS-App/DMG (auf macOS bauen) → `release/` |

Beenden im Kiosk: **Strg/Cmd + Shift + Q** (oder Alt+F4 unter Windows).

## Inhalte und Config (extern, ohne Neubau)
Die Inhalte sind **nicht** in der App enthalten. Beim Start fragt ein Dialog nach der Konfigurationsdatei (JSON). Mit `--config <Datei>` (z. B. `"Kiosk Slideshow.exe" --config D:/kiosk/config.json`) entfällt der Dialog – praktisch für Autostart. Bei ungültiger Config erscheint eine Fehlermeldung mit Gründen und der Dialog öffnet erneut; fehlende Mediendateien werden vor dem Start gemeldet und zur Laufzeit übersprungen.

Config ändern → App neu starten. Beispiel mit Medien: `example/kiosk-config.json`.

```json
{
  "settings": {
    "imageDuration": 8000,
    "fadeDuration": 800,
    "objectFit": "contain",
    "background": "#000000",
    "videoMuted": true,
    "progressBar": true,
    "noPlaylistMessage": "Für heute ist kein Programm hinterlegt.",
    "dateCheckInterval": 10000
  },
  "playlists": [
    {
      "date": "2026-10-02",
      "imageDuration": 10000,
      "slides": [
        { "type": "image", "src": "D:/kiosk/tag1/slide-01.jpg" },
        { "type": "image", "src": "D:/kiosk/tag1/slide-02.jpg", "duration": 6000 },
        { "type": "video", "src": "D:/kiosk/tag1/film.mp4" }
      ]
    }
  ]
}
```
- `settings` ist optional; fehlende Werte nehmen die Standards (wie oben gezeigt).
- Pfade: absolut empfohlen. In JSON `/` verwenden oder Backslashes verdoppeln (`C:\\Ordner\\bild.jpg`). Relative Pfade gelten ab dem Ordner der Config.
- Bilddauer = `slide.duration` → `liste.imageDuration` → `settings.imageDuration`.
- `date` = `"JJJJ-MM-TT"`, je Datum eine Liste.
- Videos: `.mp4` (H.264), `.webm`; Bilder: jpg, png, webp, gif, svg, avif.
- Dummy-Inhalte erzeugt `scripts/generate-dummy-content.py` (→ `example/media`).

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
