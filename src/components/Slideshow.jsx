import { useCallback, useEffect, useState } from "react";
import SlideRenderer from "./SlideRenderer.jsx";
import Pagination from "./Pagination.jsx";

// Ablauflogik: aktueller Index + Crossfade.
// Die neue Slide wird über die alte eingeblendet (alte bleibt voll sichtbar darunter)
// und erst nach dem Fade entfernt – so gibt es weder harte Schnitte noch Helligkeitseinbrüche.
export default function Slideshow({ slides, settings }) {
  const [state, setState] = useState({ index: 0, prev: null, tick: 0 });
  const { index, prev, tick } = state;

  const next = useCallback(() => {
    setState((s) => ({ index: (s.index + 1) % slides.length, prev: s, tick: s.tick + 1 }));
  }, [slides.length]);

  // Alte Slide nach dem Fade entfernen.
  useEffect(() => {
    if (!prev) return;
    const t = setTimeout(() => setState((s) => ({ ...s, prev: null })), settings.fadeDuration + 100);
    return () => clearTimeout(t);
  }, [tick, prev, settings.fadeDuration]);

  // Nächstes Bild vorladen.
  useEffect(() => {
    const n = slides[(index + 1) % slides.length];
    if (n?.type === "image") new Image().src = n.src;
  }, [index, slides]);

  if (!slides.length) return <div className="slideshow" />;

  const layer = (s, key, fadeIn, active) => (
    <SlideRenderer
      key={key}
      slide={slides[s.index]}
      settings={settings}
      fadeIn={fadeIn}
      active={active}
      onDone={next}
    />
  );

  return (
    <div className="slideshow" style={{ background: settings.background }}>
      {prev && layer(prev, prev.tick, false, false)}
      {layer(state, tick, true, true)}
      <Pagination count={slides.length} current={index} mode={settings.pagination} />
    </div>
  );
}
