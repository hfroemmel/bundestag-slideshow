import { useEffect, useState } from "react";
import ImageSlide from "./ImageSlide.jsx";
import VideoSlide from "./VideoSlide.jsx";
import NoticeSlide from "./NoticeSlide.jsx";

const COMPONENTS = { image: ImageSlide, video: VideoSlide, notice: NoticeSlide };

// Wählt Bild/Video/Hinweis und kümmert sich um das Einblenden (Fade).
// active=false: Slide ist nur noch Hintergrund während des Fades und meldet nichts mehr.
export default function SlideRenderer({ slide, settings, fadeIn, active, onDone }) {
  const [visible, setVisible] = useState(!fadeIn);

  useEffect(() => {
    if (visible) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    return () => cancelAnimationFrame(id);
  }, [visible]);

  const style = { opacity: visible ? 1 : 0, transition: `opacity ${settings.fadeDuration}ms ease-in-out` };
  const Component = COMPONENTS[slide.type];

  return (
    <div className="slide" style={style}>
      <Component slide={slide} settings={settings} active={active} onDone={active ? onDone : undefined} />
    </div>
  );
}
