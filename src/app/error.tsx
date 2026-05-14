"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <span className="text-5xl">🏔️</span>
      <h2 className="mt-4 text-xl font-bold text-white">
        Oups, avalanche technique !
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        {error.message || "Une erreur inattendue s'est produite."}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-glacier-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-glacier-600"
      >
        Réessayer
      </button>
    </div>
  );
}
