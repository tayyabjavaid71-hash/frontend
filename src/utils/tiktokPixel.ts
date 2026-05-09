// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TikTok Pixel helper â€” mirrors the pattern used by metaPixel.ts
// Pixel ID: D7VPDSBC77UEKU3Q3CT0  (also readable from VITE_TIKTOK_PIXEL_ID)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TtqFn = (...args: any[]) => void;

// Access ttq via index signature to avoid strict Window type conflicts
function ttq(...args: unknown[]): void {
  const win = window as unknown as Record<string, unknown>;
  if (typeof win['ttq'] === 'object' && win['ttq'] !== null) {
    const q = win['ttq'] as Record<string, unknown>;
    if (typeof q['track'] === 'function') {
      (q['track'] as TtqFn)(...args);
    }
  }
}

function isTtqReady(): boolean {
  const win = window as unknown as Record<string, unknown>;
  if (typeof win['ttq'] !== 'object' || win['ttq'] === null) return false;
  const q = win['ttq'] as Record<string, unknown>;
  return typeof q['track'] === 'function';
}

const PIXEL_ID = (import.meta.env.VITE_TIKTOK_PIXEL_ID as string) || 'D7VPDSBC77UEKU3Q3CT0';

/**
 * Inject the TikTok Pixel base snippet and fire the initial PageView.
 * Safe to call multiple times â€” idempotent.
 */
export function initTikTokPixel(): void {
  if (typeof window === 'undefined') return;
  if (isTtqReady()) return; // already initialised

  if (!PIXEL_ID) {
    console.warn('[TikTokPixel] VITE_TIKTOK_PIXEL_ID is not set â€” Pixel disabled.');
    return;
  }

  const win = window as unknown as Record<string, unknown>;
  win['TiktokAnalyticsObject'] = 'ttq';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queue: any[] = (win['ttq'] as any[] | undefined) ?? [];
  win['ttq'] = queue;

  const methods = [
    'page', 'track', 'identify', 'instances', 'debug',
    'on', 'off', 'once', 'ready', 'alias', 'group',
    'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent',
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setAndDefer = (obj: Record<string, any>, method: string) => {
    obj[method] = function (...a: unknown[]) {
      obj.push([method, ...a]);
    };
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ttqObj = win['ttq'] as Record<string, any>;
  ttqObj.methods = methods;
  ttqObj.setAndDefer = setAndDefer;
  ttqObj._i = {};
  ttqObj._t = {};
  ttqObj._o = {};

  for (const method of methods) {
    setAndDefer(ttqObj, method);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ttqObj.instance = (id: string): Record<string, any> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inst: Record<string, any> = ttqObj._i[id] ?? [];
    for (const method of methods) {
      setAndDefer(inst, method);
    }
    return inst;
  };

  ttqObj.load = (pixelId: string, options?: Record<string, unknown>) => {
    const src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
    ttqObj._i[pixelId] = [];
    ttqObj._i[pixelId]._u = src;
    ttqObj._t[pixelId] = +new Date();
    ttqObj._o[pixelId] = options ?? {};

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = `${src}?sdkid=${pixelId}&lib=ttq`;
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
  };

  ttqObj.load(PIXEL_ID);
  ttqObj.page();
}

// â”€â”€â”€ SHA-256 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Hash a string with SHA-256 (required for PII sent to TikTok). */
export async function sha256(message: string): Promise<string> {
  if (!message) return '';
  const msgBuffer = new TextEncoder().encode(message.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// â”€â”€â”€ Identify â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Send hashed PII to TikTok for advanced matching.
 * Call this on login/register when you have the user's details.
 */
export async function identifyTikTokUser(
  email: string,
  phone: string,
  userId: string,
): Promise<void> {
  if (!isTtqReady()) return;

  const [hashedEmail, hashedPhone, hashedId] = await Promise.all([
    sha256(email),
    sha256(phone),
    sha256(userId),
  ]);

  const win = window as unknown as Record<string, unknown>;
  const q = win['ttq'] as Record<string, TtqFn>;
  q['identify']({
    email: hashedEmail,
    phone_number: hashedPhone,
    external_id: hashedId,
  });
}

// â”€â”€â”€ Event Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type TikTokEventName =
  | 'ViewContent'
  | 'AddToWishlist'
  | 'Search'
  | 'AddPaymentInfo'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'PlaceAnOrder'
  | 'CompleteRegistration'
  | 'Purchase';

export interface TikTokProductData {
  id: string;
  name: string;
  type?: 'product' | 'product_group';
  value?: number;
  currency?: string;
}

// â”€â”€â”€ Track Event â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Fire a TikTok standard event and return a deduplication event_id.
 */
export function trackTikTokEvent(
  event: TikTokEventName,
  product: TikTokProductData,
  extra?: Record<string, unknown>,
): string {
  const eventId = `ttk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (!isTtqReady()) return eventId;

  ttq('track', event, {
    contents: [
      {
        content_id: product.id,
        content_type: product.type ?? 'product',
        content_name: product.name,
      },
    ],
    value: product.value ?? 0,
    currency: product.currency ?? 'PKR',
    ...extra,
  });

  return eventId;
}

/**
 * Fire a TikTok Search event (includes search_string field).
 */
export function trackTikTokSearch(
  product: TikTokProductData,
  searchString: string,
): string {
  return trackTikTokEvent('Search', product, { search_string: searchString });
}

