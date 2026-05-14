export default function StationLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 h-4 w-40 rounded bg-slate-800" />
      <div className="card-glass p-8">
        <div className="h-8 w-64 rounded bg-slate-800" />
        <div className="mt-2 h-4 w-48 rounded bg-slate-800" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-glass p-4">
            <div className="mx-auto h-4 w-16 rounded bg-slate-800" />
            <div className="mx-auto mt-2 h-6 w-12 rounded bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="mt-4 card-glass p-6">
        <div className="h-6 w-40 rounded bg-slate-800" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded bg-slate-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
