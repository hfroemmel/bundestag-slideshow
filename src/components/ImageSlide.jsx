import { useEffect } from "react";

// Zeigt ein Bild und meldet sich nach der Anzeigedauer (slide.duration oder globaler Standard).
export default function ImageSlide({ slide, settings, active, onDone }) {
  const duration = slide.duration ?? settings.imageDuration;

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => onDone?.(), duration);
    return () => clearTimeout(t);
  }, [active, duration, onDone]);

  // Defektes Bild darf die Schleife nicht blockieren: Timer läuft trotzdem weiter.
  return <img src={slide.src} alt="" draggable={false} style={{ objectFit: settings.objectFit }} />;
}
