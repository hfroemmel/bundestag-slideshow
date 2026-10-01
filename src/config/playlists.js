// Wiedergabelisten je Veranstaltungstag. Dateien liegen in public/slides/.
//
// Die App wählt anhand des lokalen Systemdatums automatisch die Liste mit passendem `date`
// (Format "JJJJ-MM-TT") und spielt sie als Endlosschleife. Gibt es für heute keine Liste,
// erscheint ein neutraler Hinweis. Ein Datumswechsel bei laufender App wird erkannt.
//
// Liste:  { date, imageDuration?: ms (Standard für Bilder dieser Liste), slides: [...] }
// Slide:  { type: "image" | "video", src: "slides/...", duration?: ms (nur Bilder) }
// Dauer eines Bildes = slide.duration ?? liste.imageDuration ?? settings.imageDuration
const playlists = [
  {
    date: "2026-10-02",
    slides: [
      { type: "image", src: "slides/2026-10-02/slide-01.jpg" },
      { type: "image", src: "slides/2026-10-02/slide-02.jpg" },
      { type: "video", src: "slides/2026-10-02/video-01.mp4" },
      { type: "image", src: "slides/2026-10-02/slide-03.jpg" },
      { type: "image", src: "slides/2026-10-02/slide-04.jpg" },
    ],
  },
  {
    date: "2026-10-03",
    imageDuration: 10000,
    slides: [
      { type: "image", src: "slides/2026-10-03/slide-01.jpg" },
      { type: "video", src: "slides/2026-10-03/video-01.mp4" },
      { type: "image", src: "slides/2026-10-03/slide-02.jpg", duration: 6000 },
      { type: "image", src: "slides/2026-10-03/slide-03.jpg" },
      { type: "image", src: "slides/2026-10-03/slide-04.jpg" },
    ],
  },
  {
    date: "2026-10-04",
    slides: [
      { type: "image", src: "slides/2026-10-04/slide-01.jpg" },
      { type: "image", src: "slides/2026-10-04/slide-02.jpg" },
      { type: "image", src: "slides/2026-10-04/slide-03.jpg" },
      { type: "video", src: "slides/2026-10-04/video-01.mp4" },
      { type: "image", src: "slides/2026-10-04/slide-04.jpg" },
    ],
  },
];

export default playlists;
