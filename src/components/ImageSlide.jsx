import { useEffect } from "react";
import ProgressBar from "./ProgressBar.jsx";

// Zeigt ein Bild und meldet sich nach der Anzeigedauer (slide.duration, bereits aufgelöst).
export default function ImageSlide({ slide, settings, active, onDone }) {
  const { duration } = slide;

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(t);
  }, [active, duration, onDone]);

  // Defektes Bild darf die Schleife nicht blockieren: Timer läuft trotzdem weiter.
  return (
    <>
      <img src={slide.src} alt="" draggable={false} style={{ objectFit: settings.objectFit }} />
      {settings.progressBar && <ProgressBar duration={duration} active={active} />}
    </>
  );
}
