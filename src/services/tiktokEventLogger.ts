// ─────────────────────────────────────────────────────────────────────────────
// TikTok Event Logger
// Fires the browser-side TikTok Pixel AND persists a row in Supabase
// so you can audit / replay events server-side if needed.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient';
import { trackTikTokEvent, trackTikTokSearch, sha256 } from '../utils/tiktokPixel';
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
  // User PII for advanced matching (hashed before sending)
  email?: string;
  phone?: string;
  externalId?: string;
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
  email,
  phone,
  externalId,
}: TikTokEventPayload): Promise<string> {
  const normalizedProductId = productId.trim() || 'unknown-item';
  const normalizedProductName = productName.trim() || eventName;
  const normalizedValue = Number.isFinite(value) ? value : 0;
  const normalizedCurrency = (currency || 'PKR').trim().toUpperCase();

  // 1. Hash PII and call ttq.identify() for advanced matching
  let hashedEmail = '';
  let hashedPhone = '';
  let hashedExternalId = '';

  if (email || phone || externalId) {
    [hashedEmail, hashedPhone, hashedExternalId] = await Promise.all([
      email ? sha256(email) : Promise.resolve(''),
      phone ? sha256(phone) : Promise.resolve(''),
      externalId ? sha256(externalId) : Promise.resolve(''),
    ]);

    const win = window as unknown as Record<string, unknown>;
    const ttq = win['ttq'] as Record<string, (...a: unknown[]) => void> | undefined;
    if (ttq && typeof ttq['identify'] === 'function') {
      ttq['identify']({
        email: hashedEmail,
        phone_number: hashedPhone,
        external_id: hashedExternalId,
      });
    }
  }

  // 2. Fire browser pixel
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

  // 3. Persist to Supabase (non-blocking — failures are logged, not thrown)
  const { error } = await supabase.from('tiktok_events').insert([
    {
      event_name: eventName,
      event_id: eventId,
      product_id: normalizedProductId,
      product_name: normalizedProductName,
      content_type: contentType,
      amount: normalizedValue,
      currency: normalizedCurrency,
      search_string: searchString ?? null,
      user_email: hashedEmail || null,
      user_phone: hashedPhone || null,
      external_id: hashedExternalId || null,
    },
  ]);

  if (error) {
    console.error('[TikTokEventLogger] Supabase insert failed:', error.message);
  }

  return eventId;
}
