import { useCallback, useEffect, useMemo, useState } from "react";
import SlideRenderer from "./SlideRenderer.jsx";
import { findPlaylist, resolveSlides, todayKey } from "../lib/schedule.js";

const NOTICE = { type: "notice" };

// Ablauflogik: aktuelle Liste (nach lokalem Datum) + Index + Crossfade.
// Die neue Slide wird über die alte eingeblendet (alte bleibt voll sichtbar darunter)
// und erst nach dem Fade entfernt – so gibt es weder harte Schnitte noch Helligkeitseinbrüche.
//
// Datumswechsel: Die Liste wird nur beim Weiterschalten neu bestimmt, ein laufender Inhalt
// wird also immer zu Ende gespielt. Der Hinweis (keine Liste) prüft zyklisch.
export default function Slideshow({ playlists, settings }) {
  // Aufgelöste Slides je Datum, einmalig berechnet.
  const resolved = useMemo(() => {
    const map = new Map();
    for (const p of playlists) {
      if (map.has(p.date)) console.warn(`Doppelte Liste für ${p.date}: nur die erste wird genutzt.`);
      else if (findPlaylist(playlists, p.date)) map.set(p.date, resolveSlides(p, settings));
    }
    return map;
  }, [playlists, settings]);

  const start = () => {
    const key = todayKey();
    const list = resolved.get(key);
    return { key, index: 0, slide: list ? list[0] : NOTICE, prev: null, tick: 0 };
  };
  const [state, setState] = useState(start);
  const { slide, prev, tick } = state;

  const next = useCallback(() => {
    const key = todayKey(); // Datum erst beim Weiterschalten auswerten
    const list = resolved.get(key);
    setState((s) => {
      if (!list) return { key, index: 0, slide: NOTICE, prev: s, tick: s.tick + 1 };
      const index = s.key === key && s.slide !== NOTICE ? (s.index + 1) % list.length : 0;
      return { key, index, slide: list[index], prev: s, tick: s.tick + 1 };
    });
  }, [resolved]);

  // Hinweis angezeigt: regelmäßig prüfen, ob inzwischen eine Liste gilt.
  useEffect(() => {
    if (slide !== NOTICE) return;
    const id = setInterval(() => {
      if (resolved.has(todayKey())) next();
    }, settings.dateCheckInterval);
    return () => clearInterval(id);
  }, [slide, resolved, next, settings.dateCheckInterval]);

  // Alte Slide nach dem Fade entfernen.
  useEffect(() => {
    if (!prev) return;
    const t = setTimeout(() => setState((s) => ({ ...s, prev: null })), settings.fadeDuration + 100);
    return () => clearTimeout(t);
  }, [tick, prev, settings.fadeDuration]);

  // Nächstes Bild vorladen.
  useEffect(() => {
    const list = resolved.get(state.key);
    const n = list?.[(state.index + 1) % list.length];
    if (n?.type === "image") new Image().src = n.src;
  }, [state.key, state.index, resolved]);

  const layer = (s, fadeIn, active) => (
    <SlideRenderer
      key={s.tick}
      slide={s.slide}
      settings={settings}
      fadeIn={fadeIn}
      active={active}
      onDone={next}
    />
  );

  return (
    <div className="slideshow" style={{ background: settings.background }}>
      {prev && layer(prev, false, false)}
      {layer(state, true, true)}
    </div>
  );
}
