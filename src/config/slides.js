// Zentrale Slide-Liste. Dateien liegen in public/slides/.
// Ein Slide: { type: "image" | "video", src: "slides/datei", duration?: ms (nur Bilder) }
// Reihenfolge = Abspielreihenfolge. Nach dem letzten Slide beginnt die Schleife neu.
// Bilder aus einer PDF: siehe README (npm run pdf-to-slides bzw. Anleitung).
const slides = [
  { type: "image", src: "slides/slide-01.jpg" },
  { type: "image", src: "slides/slide-02.jpg" },
  { type: "video", src: "slides/video-01.mp4" },
  { type: "image", src: "slides/slide-03.jpg" },
  { type: "image", src: "slides/slide-04.jpg" },
  { type: "image", src: "slides/slide-05.jpg" },
];

export default slides;
