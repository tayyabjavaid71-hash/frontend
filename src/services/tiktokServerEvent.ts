// ─────────────────────────────────────────────────────────────────────────────
// TikTok Server-Side Event Service
// Fires events via TWO server-side channels for maximum reliability:
//   1. Express backend   → /api/tiktok/events      (Vercel serverless)
//   2. Supabase Edge Fn  → /functions/v1/tiktok-events  (Deno edge runtime)
// Both channels hash PII and forward to the TikTok Conversions API (CAPI).
// Errors are silently swallowed — tracking must never break the UX.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE      = import.meta.env.VITE_API_URL        ?? 'http://localhost:3001';
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL   ?? '';
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

const EXPRESS_ENDPOINT = `${API_BASE}/api/tiktok/events`;
const EDGE_ENDPOINT    = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/tiktok-events` : '';

export interface TikTokServerPayload {
  event_name: string;
  value?: number;
  currency?: string;
  event_id?: string;
  contents?: Array<{
    content_id: string;
    content_type: string;
    content_name: string;
    quantity?: number;
    price?: number;
  }>;
  num_items?: number;
  search_string?: string;
  page_url?: string;
  email?: string;
  phone?: string;
  external_id?: string;
  user_id?: string;
}

/**
 * Fire a server-side TikTok CAPI event.
 * Sends to both the Express backend and the Supabase Edge Function in parallel.
 * Either channel succeeding is sufficient — both failing is silently ignored.
 */
export async function sendTikTokServerEvent(payload: TikTokServerPayload): Promise<void> {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const requests: Promise<unknown>[] = [
    fetch(EXPRESS_ENDPOINT, { method: 'POST', headers, body }).catch(() => null),
  ];

  if (EDGE_ENDPOINT) {
    const edgeHeaders: Record<string, string> = { ...headers };
    if (SUPABASE_ANON) edgeHeaders['apikey'] = SUPABASE_ANON;
    requests.push(
      fetch(EDGE_ENDPOINT, { method: 'POST', headers: edgeHeaders, body }).catch(() => null),
    );
  }

  // Fire and forget — never await, never throw
  Promise.allSettled(requests).catch(() => null);
}

