// Allgemeine Einstellungen der Slideshow.
const settings = {
  imageDuration: 8000, // globale Standard-Anzeigedauer für Bilder in ms (überschreibbar je Liste/Slide)
  fadeDuration: 800, // Dauer des Überblendens in ms
  objectFit: "contain", // "contain" (vollständig sichtbar) | "cover" (füllend, beschneidet)
  background: "#000000", // Farbe der Freiflächen
  videoMuted: true, // false = Ton ausgeben
  progressBar: true, // schmale Restzeit-Leiste am unteren Rand
  noPlaylistMessage: "Für heute ist kein Programm hinterlegt.", // Hinweis ohne Liste für das aktuelle Datum
  dateCheckInterval: 10000, // ms; Prüfintervall auf Datumswechsel, solange der Hinweis angezeigt wird
};

export default settings;
