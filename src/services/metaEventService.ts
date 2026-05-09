// ─────────────────────────────────────────────────────────────────────────────
// Meta Event Service
// Sends server-side Conversion API (CAPI) events to the backend so they can
// be stored in Supabase and forwarded to the Meta Graph API for deduplication.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const ENDPOINT = `${API_BASE}/api/meta/events`;

export interface MetaEventPayload {
  event_name: string;
  value?: number;
  currency?: string;
  event_id: string;
  content_name?: string;
  content_ids?: string[];
  num_items?: number;
  email?: string;  // passed to backend for SHA-256 hashing — never exposed to Meta directly
  phone?: string;
}

/**
 * Fire a server-side CAPI event.
 * Errors are silently swallowed — tracking must never break the UX.
 */
export async function sendMetaEvent(payload: MetaEventPayload): Promise<void> {
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, currency: payload.currency ?? 'PKR' }),
    });
  } catch {
    // Non-blocking — tracking failure must not break the user experience
  }
}
