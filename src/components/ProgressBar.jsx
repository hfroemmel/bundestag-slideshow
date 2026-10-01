// Restzeit-Leiste am unteren Rand (liegt über dem Inhalt, braucht keinen Layout-Platz).
// Linke Kante fix, rechte Kante wandert nach links: scaleX 1 -> 0 mit transform-origin links.
// - Bild: `duration` (ms) -> CSS-Animation, startet beim Mounten bei 100 %.
// - Video: `videoRef` -> Breite folgt currentTime/duration des Videos (pausiert das Video, steht die Leiste).
import { useEffect, useRef } from "react";

export default function ProgressBar({ duration, videoRef, active }) {
  const fill = useRef(null);

  useEffect(() => {
    if (!videoRef || !active) return;
    let raf;
    const tick = () => {
      const v = videoRef.current;
      if (v && fill.current) {
        const left = v.duration > 0 ? 1 - v.currentTime / v.duration : 1;
        fill.current.style.transform = `scaleX(${Math.min(1, Math.max(0, left))})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [videoRef, active]);

  if (!active) return null;

  return (
    <div className="progress" aria-hidden="true">
      <div
        ref={fill}
        className={videoRef ? "progress-fill" : "progress-fill progress-timed"}
        style={videoRef ? undefined : { animationDuration: `${duration}ms` }}
      />
    </div>
  );
}
