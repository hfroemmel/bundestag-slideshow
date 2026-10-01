// Lädt und validiert die externe Konfigurationsdatei (JSON).
const fs = require("fs");
const path = require("path");

const DEFAULT_SETTINGS = {
  imageDuration: 8000, // globale Standard-Anzeigedauer für Bilder (ms)
  fadeDuration: 800, // Dauer des Überblendens (ms)
  objectFit: "contain", // "contain" | "cover"
  background: "#000000", // Farbe der Freiflächen
  videoMuted: true, // false = Ton ausgeben
  progressBar: true, // Restzeit-Leiste am unteren Rand
  noPlaylistMessage: "Für heute ist kein Programm hinterlegt.",
  dateCheckInterval: 10000, // ms; Datumsprüfung während der Hinweis angezeigt wird
};

const isPosNum = (v) => typeof v === "number" && Number.isFinite(v) && v > 0;

/**
 * Liest die Config. Rückgabe: { config, errors, warnings }.
 * config.playlists[].slides[].file = absoluter Pfad (relative Pfade gelten ab dem Ordner der Config).
 * errors = Konfiguration unbrauchbar; warnings = z. B. fehlende Mediendateien.
 */
function loadConfig(file) {
  const errors = [];
  const warnings = [];
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));
  } catch (e) {
    return { config: null, errors: [`Datei nicht lesbar oder kein gültiges JSON: ${e.message}`], warnings };
  }

  const settings = { ...DEFAULT_SETTINGS, ...(raw.settings || {}) };
  if (!isPosNum(settings.imageDuration)) errors.push("settings.imageDuration muss eine Zahl > 0 (ms) sein.");
  if (!isPosNum(settings.fadeDuration)) errors.push("settings.fadeDuration muss eine Zahl > 0 (ms) sein.");
  if (!isPosNum(settings.dateCheckInterval)) errors.push("settings.dateCheckInterval muss eine Zahl > 0 (ms) sein.");
  if (!["contain", "cover"].includes(settings.objectFit)) errors.push('settings.objectFit muss "contain" oder "cover" sein.');

  if (!Array.isArray(raw.playlists) || !raw.playlists.length) errors.push("playlists muss eine nicht-leere Liste sein.");
  const baseDir = path.dirname(path.resolve(file));
  const seen = new Set();
  const playlists = (Array.isArray(raw.playlists) ? raw.playlists : []).map((p, i) => {
    const where = `playlists[${i}]`;
    if (typeof p?.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) errors.push(`${where}.date muss "JJJJ-MM-TT" sein.`);
    else if (seen.has(p.date)) errors.push(`${where}.date ${p.date} ist doppelt vorhanden.`);
    else seen.add(p.date);
    if (p?.imageDuration != null && !isPosNum(p.imageDuration)) errors.push(`${where}.imageDuration muss eine Zahl > 0 sein.`);
    if (!Array.isArray(p?.slides) || !p.slides.length) errors.push(`${where}.slides muss eine nicht-leere Liste sein.`);

    const slides = (Array.isArray(p?.slides) ? p.slides : []).map((s, j) => {
      const sw = `${where}.slides[${j}]`;
      if (!["image", "video"].includes(s?.type)) errors.push(`${sw}.type muss "image" oder "video" sein.`);
      if (typeof s?.src !== "string" || !s.src) errors.push(`${sw}.src fehlt.`);
      if (s?.duration != null && !isPosNum(s.duration)) errors.push(`${sw}.duration muss eine Zahl > 0 sein.`);
      const abs = typeof s?.src === "string" ? path.resolve(baseDir, s.src) : "";
      if (abs && !fs.existsSync(abs)) warnings.push(`Datei fehlt: ${abs}`);
      return { type: s?.type, file: abs, duration: s?.duration };
    });
    return { date: p?.date, imageDuration: p?.imageDuration, slides };
  });

  if (errors.length) return { config: null, errors, warnings };
  return { config: { settings, playlists }, errors, warnings };
}

module.exports = { loadConfig };
