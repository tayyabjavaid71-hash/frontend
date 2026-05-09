// ─────────────────────────────────────────────────────────────────────────────
// Meta Pixel + Conversion API helper
// Pixel ID is loaded from VITE_META_PIXEL_ID env variable.
// All monetary values are tracked in PKR.
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FbqFn = (...args: any[]) => void;

// Access fbq via index signature to avoid strict Window type conflicts
function fbq(...args: unknown[]): void {
  const win = window as unknown as Record<string, unknown>;
  if (typeof win['fbq'] === 'function') {
    (win['fbq'] as FbqFn)(...args);
  }
}

function isFbqReady(): boolean {
  const win = window as unknown as Record<string, unknown>;
  return typeof win['fbq'] === 'function';
}

const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string;

/** Inject the Facebook Pixel base snippet and fire the initial PageView. */
export function initMetaPixel(): void {
  if (!PIXEL_ID) {
    console.warn('[MetaPixel] VITE_META_PIXEL_ID is not set — Pixel disabled.');
    return;
  }
  if (isFbqReady()) return; // already initialised

  // Standard FB Pixel inline bootstrap
  (function (win: Record<string, unknown>, doc: Document, scriptTag: string, src: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const n: any = function (...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((n as any).callMethod) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (n as any).callMethod(...args);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (n as any).queue.push(args);
      }
    };
    win['fbq'] = n;
    if (!win['_fbq']) win['_fbq'] = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const t = doc.createElement(scriptTag) as HTMLScriptElement;
    t.async = true;
    t.src = src;
    const s = doc.getElementsByTagName(scriptTag)[0];
    s.parentNode?.insertBefore(t, s);
  })(
    window as unknown as Record<string, unknown>,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js',
  );

  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
}

/** Fire a Meta Pixel standard event and return the deduplication event_id. */
export function trackPixelEvent(
  eventName: string,
  data: Record<string, unknown> = {},
): string {
  const eventId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  fbq('track', eventName, { currency: 'PKR', ...data }, { eventID: eventId });

  return eventId;
}
