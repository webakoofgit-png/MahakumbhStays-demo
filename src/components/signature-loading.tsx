export function PageSkeleton() {
  return (
    <div
      className="container section page-skeleton"
      role="status"
      aria-label="Getting your stay ready"
    >
      <span className="sr-only">Getting your stay ready…</span>
      <div className="skeleton-heading" />
      <div className="skeleton-intro" />
      <div className="skeleton-gallery" />
      <div className="skeleton-columns">
        <div />
        <div />
      </div>
    </div>
  );
}
