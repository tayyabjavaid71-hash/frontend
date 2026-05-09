// ─────────────────────────────────────────────────────────────────────────────
// TikTok Event Logger
// Fires the browser-side TikTok Pixel AND persists a row in Supabase
// so you can audit / replay events server-side if needed.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient';
import { trackTikTokEvent, trackTikTokSearch } from '../utils/tiktokPixel';
import type { TikTokEventName } from '../utils/tiktokPixel';

export interface TikTokEventPayload {
  eventName: TikTokEventName;
  productId: string;
  productName: string;
  value?: number;
  currency?: string;
  contentType?: 'product' | 'product_group';
  searchString?: string;
}

/**
 * Fire a TikTok Pixel event in the browser and save a log row to Supabase.
 * Returns the generated event_id for deduplication.
 */
export async function logTikTokEvent({
  eventName,
  productId,
  productName,
  value = 0,
  currency = 'PKR',
  contentType = 'product',
  searchString,
}: TikTokEventPayload): Promise<string> {
  // 1. Fire browser pixel
  const eventId =
    eventName === 'Search' && searchString
      ? trackTikTokSearch({ id: productId, name: productName, value, currency, type: contentType }, searchString)
      : trackTikTokEvent(eventName, { id: productId, name: productName, value, currency, type: contentType });

  // 2. Persist to Supabase (non-blocking — failures are logged, not thrown)
  const { error } = await supabase.from('tiktok_events').insert([
    {
      event_name: eventName,
      event_id: eventId,
      product_id: productId,
      product_name: productName,
      amount: value,
      currency,
      search_string: searchString ?? null,
    },
  ]);

  if (error) {
    console.error('[TikTokEventLogger] Supabase insert failed:', error.message);
  }

  return eventId;
}
