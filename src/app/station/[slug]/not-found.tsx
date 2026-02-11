export default function StationNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <span className="text-5xl">🏔️</span>
      <h2 className="mt-4 text-xl font-bold text-white">
        Station introuvable
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        Cette station n&apos;existe pas dans notre référentiel.
      </p>
      <a
        href="/"
        className="mt-6 rounded-xl bg-glacier-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-glacier-600"
      >
        ← Retour au classement
      </a>
    </div>
  );
}
