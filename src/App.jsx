import { useEffect, useState } from "react";
import Slideshow from "./components/Slideshow.jsx";

// Die Konfiguration (Einstellungen + Wiedergabelisten) liefert der Electron-Main-Prozess
// aus der vom Benutzer gewählten externen Datei.
export default function App() {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    window.kiosk?.getConfig().then(setConfig);
  }, []);

  if (!config) return null; // schwarzer Hintergrund bis die Config da ist
  return <Slideshow playlists={config.playlists} settings={config.settings} />;
}
