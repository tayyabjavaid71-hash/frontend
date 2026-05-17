// =============================================
// BANNER CMS — Full TypeScript Types (v2)
// =============================================

export type BannerType       = 'hero' | 'promo' | 'sale' | 'seasonal';
export type BackgroundType   = 'gradient' | 'solid' | 'image';
export type ContentPosition  = 'left' | 'center' | 'right';
export type AnimationType    = 'slide' | 'fade' | 'zoom' | 'flip';
export type DeviceType       = 'all' | 'desktop' | 'mobile';
export type StyleType        = 'primary' | 'secondary' | 'outline';

export interface BannerButton {
  id: string;
  banner_id: string;
  text: string;
  link: string;
  style_type: StyleType;
  background_color?: string;
  text_color?: string;
  border_color?: string;
  border_radius: string;
  padding: string;
  shadow_style?: string;
  hover_background?: string;
  hover_color?: string;
  icon?: string;
  open_new_tab: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Banner {
  id: string;

  // Content
  title: string;
  subtitle?: string;
  description?: string;

  // Images
  desktop_image: string;
  mobile_image?: string;

  // Type
  banner_type: BannerType;

  // Background
  background_type: BackgroundType;
  background_color?: string;
  gradient_start: string;
  gradient_end: string;

  // Overlay
  overlay_enabled: boolean;
  overlay_color: string;

  // Typography
  text_color: string;
  font_family: string;
  title_size: string;
  description_size: string;

  // Layout
  content_position: ContentPosition;

  // Slider
  auto_slide: boolean;
  slide_duration: number;
  animation_type: AnimationType;

  // Visibility
  is_active: boolean;
  sort_order: number;

  // Scheduling
  start_date?: string;
  end_date?: string;

  // Targeting
  device_type: DeviceType;
  country_code?: string;
  variant?: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relations (loaded via join)
  banner_buttons?: BannerButton[];
  banner_versions?: BannerVersion[];
}

export interface BannerVersion {
  id: string;
  banner_id: string;
  previous_data: Partial<Banner>;
  changed_by?: string;
  created_at: string;
}

export interface ButtonStyle {
  id: string;
  name: string;
  background?: string;
  color?: string;
  border_style?: string;
  hover_background?: string;
  hover_color?: string;
  border_radius: string;
  shadow_style?: string;
  padding: string;
}

export interface BannerAnalytics {
  id: string;
  banner_id: string;
  button_id?: string;
  event_type: 'impression' | 'click';
  device?: string;
  country?: string;
  user_agent?: string;
  created_at: string;
}

export interface BannerAnalyticsSummary {
  impressions: number;
  clicks: number;
  ctr: string;
  raw: BannerAnalytics[];
}

// ── Forms ──────────────────────────────────────────────────────────────────────

export interface BannerFormData {
  title: string;
  subtitle: string;
  description: string;
  desktop_image: string;
  mobile_image: string;
  banner_type: BannerType;
  background_type: BackgroundType;
  background_color: string;
  gradient_start: string;
  gradient_end: string;
  overlay_enabled: boolean;
  overlay_color: string;
  text_color: string;
  font_family: string;
  title_size: string;
  description_size: string;
  content_position: ContentPosition;
  auto_slide: boolean;
  slide_duration: number;
  animation_type: AnimationType;
  is_active: boolean;
  sort_order: number;
  start_date: string;
  end_date: string;
  device_type: DeviceType;
  country_code: string;
  variant: string;
  buttons: Omit<BannerButton, 'banner_id'>[];
}

export const DEFAULT_BANNER_FORM: BannerFormData = {
  title:            '',
  subtitle:         '',
  description:      '',
  desktop_image:    '',
  mobile_image:     '',
  banner_type:      'hero',
  background_type:  'gradient',
  background_color: '#7C3AED',
  gradient_start:   '#3b0764',
  gradient_end:     '#7C3AED',
  overlay_enabled:  true,
  overlay_color:    '#3b0764',
  text_color:       '#ffffff',
  font_family:      'Inter',
  title_size:       '64px',
  description_size: '20px',
  content_position: 'left',
  auto_slide:       true,
  slide_duration:   5000,
  animation_type:   'slide',
  is_active:        true,
  sort_order:       0,
  start_date:       '',
  end_date:         '',
  device_type:      'all',
  country_code:     '',
  variant:          'A',
  buttons: [
    {
      id:               `new-${Date.now()}`,
      text:             'Shop Now',
      link:             '/shop',
      style_type:       'primary',
      background_color: '#FBBF24',
      text_color:       '#000000',
      border_radius:    '14px',
      padding:          '16px 30px',
      open_new_tab:     false,
      sort_order:       0,
    },
  ],
};
