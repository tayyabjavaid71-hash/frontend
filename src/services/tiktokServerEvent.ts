// ─────────────────────────────────────────────────────────────────────────────
// TikTok Server-Side Event Service
// Sends server-side Conversions API (CAPI) events to the backend so they can
// be stored in Supabase and forwarded to the TikTok Events API.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const ENDPOINT = `${API_BASE}/api/tiktok/events`;

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
}

/**
 * Fire a server-side TikTok CAPI event via the backend.
 * Errors are silently swallowed — tracking must never break the UX.
 */
export async function sendTikTokServerEvent(payload: TikTokServerPayload): Promise<void> {
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-blocking — tracking failure must not break the user experience
  }
}
