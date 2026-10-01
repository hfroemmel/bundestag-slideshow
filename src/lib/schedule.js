// Datumslogik: lokale Systemzeit -> passende Wiedergabeliste.

/** Lokales Datum als "JJJJ-MM-TT" (nicht UTC!). */
export function todayKey(now = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

/** Liste für ein Datum oder null. Leere Listen zählen als "keine Liste". */
export function findPlaylist(playlists, dateKey) {
  const list = playlists.find((p) => p.date === dateKey);
  return list && list.slides?.length ? list : null;
}

/** Slides einer Liste mit aufgelöster Bilddauer (Slide > Liste > global). */
export function resolveSlides(list, settings) {
  return list.slides.map((s) => ({
    ...s,
    duration: s.duration ?? list.imageDuration ?? settings.imageDuration,
  }));
}
