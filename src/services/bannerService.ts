import { supabase } from './supabaseClient';
import type { Banner, BannerButton, BannerCreateInput, BannerUpdateInput, ButtonStyle } from '../types/banner';

// ── Public API ───────────────────────────────────────

/** Fetch all currently active banners (with their buttons) */
export async function getBanners(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select(`
      *,
      banner_buttons (*)
    `)
    .eq('is_active', true)
    .or('start_date.is.null,start_date.lte.' + new Date().toISOString())
    .or('end_date.is.null,end_date.gte.'     + new Date().toISOString())
    .order('sort_order', { ascending: true });

  if (error) throw error;
  // Sort buttons inside each banner
  return (data as Banner[]).map(b => ({
    ...b,
    banner_buttons: b.banner_buttons?.sort((a, b) => a.sort_order - b.sort_order) ?? [],
  }));
}

// ── Admin API ─────────────────────────────────────────

/** Fetch ALL banners (active + inactive) — admin use */
export async function getAllBannersAdmin(): Promise<Banner[]> {
  const { data, error } = await supabase
    .from('banners')
    .select(`*, banner_buttons (*)`)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as Banner[];
}

/** Create a new banner */
export async function createBanner(input: BannerCreateInput): Promise<Banner> {
  const { data, error } = await supabase
    .from('banners')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Banner;
}

/** Update an existing banner */
export async function updateBanner({ id, ...rest }: BannerUpdateInput): Promise<Banner> {
  const { data, error } = await supabase
    .from('banners')
    .update(rest)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Banner;
}

/** Delete a banner (cascade removes buttons + analytics) */
export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}

/** Toggle is_active for a banner */
export async function toggleBannerActive(id: string, is_active: boolean): Promise<void> {
  const { error } = await supabase
    .from('banners')
    .update({ is_active })
    .eq('id', id);
  if (error) throw error;
}

/** Reorder banners — pass ordered array of { id, sort_order } */
export async function reorderBanners(items: { id: string; sort_order: number }[]): Promise<void> {
  const updates = items.map(({ id, sort_order }) =>
    supabase.from('banners').update({ sort_order }).eq('id', id)
  );
  await Promise.all(updates);
}

// ── Banner Buttons ────────────────────────────────────

export async function addBannerButton(button: Omit<BannerButton, 'id'>): Promise<BannerButton> {
  const { data, error } = await supabase
    .from('banner_buttons')
    .insert(button)
    .select()
    .single();

  if (error) throw error;
  return data as BannerButton;
}

export async function updateBannerButton(id: string, updates: Partial<BannerButton>): Promise<void> {
  const { error } = await supabase.from('banner_buttons').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteBannerButton(id: string): Promise<void> {
  const { error } = await supabase.from('banner_buttons').delete().eq('id', id);
  if (error) throw error;
}

// ── Button Styles ─────────────────────────────────────

export async function getButtonStyles(): Promise<ButtonStyle[]> {
  const { data, error } = await supabase
    .from('button_styles')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as ButtonStyle[];
}

// ── Image Upload ──────────────────────────────────────

/**
 * Upload a banner image file to Supabase Storage (bucket: banner-images).
 * Returns the public URL.
 */
export async function uploadBannerImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('banner-images')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('banner-images').getPublicUrl(path);
  return data.publicUrl;
}

// ── Analytics ─────────────────────────────────────────

export async function trackBannerEvent(
  banner_id: string,
  event_type: 'impression' | 'click',
  button_id?: string
): Promise<void> {
  await supabase.from('banner_analytics').insert({
    banner_id,
    event_type,
    button_id: button_id ?? null,
    user_agent: navigator.userAgent,
  });
}
