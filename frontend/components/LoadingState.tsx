export default function LoadingState() {
  return (
    <div className="task-list skeleton-list" aria-label="Loading tasks">
      {[1, 2, 3].map((item) => (
        <div className="task-row skeleton-row" key={item}>
          <span className="skeleton-circle" />
          <span className="skeleton-line" />
        </div>
      ))}
    </div>
  );
}

