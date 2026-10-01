import { useEffect, useRef } from "react";
import ProgressBar from "./ProgressBar.jsx";

// Video ohne Controls, startet bei 0:00, wechselt erst nach "ended".
// Bei Fehlern (Datei fehlt/defekt) wird nach kurzer Zeit weitergeschaltet, damit nichts hängen bleibt.
export default function VideoSlide({ slide, settings, active, onDone }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || !active) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [active]);

  const onError = () => {
    if (active) setTimeout(() => onDone?.(), 2000);
  };

  return (
    <>
      <video
        ref={ref}
        src={slide.src}
        autoPlay={active}
        muted={settings.videoMuted}
        playsInline
        controls={false}
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        preload="auto"
        style={{ objectFit: settings.objectFit }}
        onEnded={() => onDone?.()}
        onError={onError}
      />
      {settings.progressBar && <ProgressBar videoRef={ref} active={active} />}
    </>
  );
}
