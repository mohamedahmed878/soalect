import "./loading.css";

export function Spinner({ size = 28 }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label="جاري التحميل"
    />
  );
}

export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton" style={{ aspectRatio: "4 / 5" }} />
          <div className="skeleton" style={{ height: 14, width: "70%", marginTop: 14 }} />
          <div className="skeleton" style={{ height: 14, width: "40%", marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="page-loading">
      <Spinner size={34} />
    </div>
  );
}
