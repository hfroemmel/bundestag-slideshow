// Rein visuelle, nicht interaktive Fortschrittsanzeige.
export default function Pagination({ count, current, mode }) {
  if (mode === "none" || count < 2) return null;

  return (
    <div className="pagination" aria-hidden="true">
      {mode === "count" ? (
        <span className="pagination-count">{current + 1} / {count}</span>
      ) : (
        Array.from({ length: count }, (_, i) => (
          <span key={i} className={i === current ? "dot dot-active" : "dot"} />
        ))
      )}
    </div>
  );
}
