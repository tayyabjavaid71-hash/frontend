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
  extraPayload?: Record<string, unknown>;
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
  extraPayload,
}: TikTokEventPayload): Promise<string> {
  const normalizedProductId = productId.trim() || 'unknown-item';
  const normalizedProductName = productName.trim() || eventName;
  const normalizedValue = Number.isFinite(value) ? value : 0;
  const normalizedCurrency = (currency || 'PKR').trim().toUpperCase();

  // 1. Fire browser pixel
  const eventId =
    eventName === 'Search' && searchString
      ? trackTikTokSearch(
          {
            id: normalizedProductId,
            name: normalizedProductName,
            value: normalizedValue,
            currency: normalizedCurrency,
            type: contentType,
          },
          searchString,
        )
      : trackTikTokEvent(eventName, {
          id: normalizedProductId,
          name: normalizedProductName,
          value: normalizedValue,
          currency: normalizedCurrency,
          type: contentType,
        }, extraPayload);

  // 2. Persist to Supabase (non-blocking — failures are logged, not thrown)
  const { error } = await supabase.from('tiktok_events').insert([
    {
      event_name: eventName,
      event_id: eventId,
      product_id: normalizedProductId,
      product_name: normalizedProductName,
      amount: normalizedValue,
      currency: normalizedCurrency,
      search_string: searchString ?? null,
    },
  ]);

  if (error) {
    console.error('[TikTokEventLogger] Supabase insert failed:', error.message);
  }

  return eventId;
}
