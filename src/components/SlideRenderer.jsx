import { useEffect, useState } from "react";
import ImageSlide from "./ImageSlide.jsx";
import VideoSlide from "./VideoSlide.jsx";

// Wählt Bild/Video und kümmert sich um das Einblenden (Fade).
// active=false: Slide ist nur noch Hintergrund während des Fades und meldet nichts mehr.
export default function SlideRenderer({ slide, settings, fadeIn, active, onDone }) {
  const [visible, setVisible] = useState(!fadeIn);

  useEffect(() => {
    if (visible) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    return () => cancelAnimationFrame(id);
  }, [visible]);

  const style = { opacity: visible ? 1 : 0, transition: `opacity ${settings.fadeDuration}ms ease-in-out` };
  const done = active ? onDone : undefined;
  const Component = slide.type === "video" ? VideoSlide : ImageSlide;

  return (
    <div className="slide" style={style}>
      <Component slide={slide} settings={settings} active={active} onDone={done} />
    </div>
  );
}
