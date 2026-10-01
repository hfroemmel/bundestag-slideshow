import Slideshow from "./components/Slideshow.jsx";
import playlists from "./config/playlists.js";
import settings from "./config/settings.js";

export default function App() {
  return <Slideshow playlists={playlists} settings={settings} />;
}
