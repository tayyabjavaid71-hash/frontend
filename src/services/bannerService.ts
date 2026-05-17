import { supabase } from './supabaseClient';
import type { Banner, BannerButton, BannerFormData, BannerAnalyticsSummary } from '../types/banner';

// ── Determine API base URL ───────────────────────────────────────────────────
// VITE_API_URL may be bare host (http://localhost:3001) or already include /api
const _rawBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const API_BASE = _rawBase.endsWith('/api')
  ? _rawBase
  : `${_rawBase.replace(/\/$/, '')}/api`;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Public: active banners for the hero slider ───────────────────────────────
export async function getBanners(): Promise<Banner[]> {
  return apiFetch<Banner[]>('/banners/active');
}

// ── Admin: all banners (incl. inactive) ──────────────────────────────────────
export async function getAllBannersAdmin(): Promise<Banner[]> {
  return apiFetch<Banner[]>('/banners');
}

// ── Admin: single banner ─────────────────────────────────────────────────────
export async function getBannerById(id: string): Promise<Banner> {
  return apiFetch<Banner>(`/banners/${id}`);
}

// ── Admin: create ─────────────────────────────────────────────────────────────
export async function createBanner(data: Omit<BannerFormData, 'buttons'> & { buttons?: Partial<BannerButton>[] }): Promise<Banner> {
  return apiFetch<Banner>('/banners', { method: 'POST', body: JSON.stringify(data) });
}

// ── Admin: update ─────────────────────────────────────────────────────────────
export async function updateBanner(id: string, data: Partial<BannerFormData> & { buttons?: Partial<BannerButton>[] }): Promise<Banner> {
  return apiFetch<Banner>(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

// ── Admin: delete ─────────────────────────────────────────────────────────────
export async function deleteBanner(id: string): Promise<void> {
  await apiFetch(`/banners/${id}`, { method: 'DELETE' });
}

// ── Admin: toggle active ─────────────────────────────────────────────────────
export async function toggleBannerActive(id: string, is_active: boolean): Promise<void> {
  await apiFetch(`/banners/${id}/toggle`, { method: 'PATCH', body: JSON.stringify({ is_active }) });
}

// ── Admin: reorder ────────────────────────────────────────────────────────────
export async function reorderBanners(items: Array<{ id: string; sort_order: number }>): Promise<void> {
  await apiFetch('/banners/reorder', { method: 'POST', body: JSON.stringify({ items }) });
}

// ── Version history ──────────────────────────────────────────────────────────
export async function getBannerVersions(bannerId: string): Promise<import('../types/banner').BannerVersion[]> {
  return apiFetch<import('../types/banner').BannerVersion[]>(
    `/banners/${bannerId}/versions`
  );
}

export async function restoreBannerVersion(bannerId: string, version_id: string): Promise<Banner> {
  return apiFetch<Banner>(`/banners/${bannerId}/restore`, {
    method: 'POST',
    body: JSON.stringify({ version_id }),
  });
}

// ── Analytics ────────────────────────────────────────────────────────────────
export async function getBannerAnalytics(bannerId: string): Promise<BannerAnalyticsSummary> {
  return apiFetch<BannerAnalyticsSummary>(`/banners/${bannerId}/analytics`);
}

export async function getAllAnalyticsSummary(): Promise<Record<string, { impressions: number; clicks: number }>> {
  return apiFetch('/banners/analytics');
}

// ── Image Upload (direct to Supabase Storage) ────────────────────────────────
export async function uploadBannerImage(file: File): Promise<string> {
  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from('banner-images')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('banner-images').getPublicUrl(path);
  return data.publicUrl;
}

// ── Analytics: track event (client-side, direct Supabase) ─────────────────
export async function trackBannerEvent(
  banner_id: string,
  event_type: 'impression' | 'click',
  button_id?: string
): Promise<void> {
  const device =
    /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

  await supabase.from('banner_analytics').insert({
    banner_id,
    event_type,
    button_id:  button_id ?? null,
    device,
    user_agent: navigator.userAgent,
  });
}

// ── Button helpers (direct Supabase for admin) ────────────────────────────────
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
