import Slideshow from "./components/Slideshow.jsx";
import slides from "./config/slides.js";
import settings from "./config/settings.js";

export default function App() {
  return <Slideshow slides={slides} settings={settings} />;
}
