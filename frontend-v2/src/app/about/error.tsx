"use client";

export default function AboutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-8">
      <h1 className="text-6xl font-black text-zinc-700 mb-4">Oops</h1>
      <p className="text-zinc-500 max-w-md mb-8">Failed to load this page.</p>
      <button
        onClick={reset}
        className="px-6 py-2 rounded-full bg-white text-black font-bold text-sm hover:opacity-80 transition-opacity"
      >
        Try Again
      </button>
    </div>
  );
}
