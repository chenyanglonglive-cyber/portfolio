/**
 * Global video preload cache — survives component unmount.
 *
 * When a user hovers near a video card, we preload metadata (and the first
 * few MB) into the browser's HTTP cache.  When they actually hover, the
 * <video> src hits the already-warm cache → instant playback.
 *
 * The cache also remembers durations so the duration badge shows immediately
 * on remount instead of flashing "00:30" while waiting for loadedmetadata.
 */

interface CachedEntry {
  duration: number; // seconds, NaN until metadata arrives
  status: "preloading" | "ready" | "error";
}

const store = new Map<string, CachedEntry>();
const MAX_SIZE = 12;
const PRELOAD_DISTANCE_PX = 80; // start preload when cursor is this close

export { PRELOAD_DISTANCE_PX };

/** Return cached duration (seconds) or NaN if not cached. */
export function getCachedDuration(url: string): number {
  return store.get(url)?.duration ?? NaN;
}

/** True if we've already preloaded this URL. */
export function isPreloaded(url: string): boolean {
  const e = store.get(url);
  return e?.status === "ready" || e?.status === "preloading";
}

/**
 * Start preloading video metadata into the browser cache.
 * Safe to call multiple times — second call is a no-op.
 */
export function preloadVideo(url: string): void {
  if (!url || store.has(url)) return;

  // Enforce cap — evict oldest
  if (store.size >= MAX_SIZE) {
    const first = store.keys().next().value;
    if (first) store.delete(first);
  }

  store.set(url, { duration: NaN, status: "preloading" });

  const el = document.createElement("video");
  el.preload = "metadata";
  el.muted = true;
  el.crossOrigin = "anonymous";
  el.src = url;

  el.addEventListener(
    "loadedmetadata",
    () => {
      const cur = store.get(url);
      store.set(url, {
        duration:
          el.duration && !isNaN(el.duration) ? el.duration : cur?.duration ?? NaN,
        status: "ready",
      });
      // Detach src so the element can be GC'd
      el.removeAttribute("src");
      el.load();
    },
    { once: true }
  );

  el.addEventListener(
    "error",
    () => {
      store.set(url, { duration: NaN, status: "error" });
      el.removeAttribute("src");
      el.load();
    },
    { once: true }
  );
}
