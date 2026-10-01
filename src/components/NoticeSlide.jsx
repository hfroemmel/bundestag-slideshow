// Neutraler Hinweis, wenn für das aktuelle Datum keine Liste hinterlegt ist.
export default function NoticeSlide({ settings }) {
  return <div className="notice">{settings.noPlaylistMessage}</div>;
}
