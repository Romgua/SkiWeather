export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-700 border-t-glacier-500" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl">
          🎿
        </span>
      </div>
      <p className="mt-6 text-sm text-slate-400 animate-pulse">
        Analyse des conditions en cours...
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Interrogation de {50} stations météo
      </p>
    </div>
  );
}
