// Banner CMS TypeScript Types

export interface BannerButton {
  id: string;
  banner_id: string;
  text: string;
  link: string;
  style_type: 'primary' | 'secondary' | 'outline';
  background_color?: string;
  text_color?: string;
  border_color?: string;
  open_new_tab: boolean;
  sort_order: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  desktop_image: string;
  mobile_image?: string;
  overlay_enabled: boolean;
  overlay_color: string;
  is_active: boolean;
  sort_order: number;
  auto_slide: boolean;
  slide_duration: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  // Loaded via join
  banner_buttons?: BannerButton[];
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

export interface BannerCreateInput {
  title: string;
  subtitle?: string;
  description?: string;
  desktop_image: string;
  mobile_image?: string;
  overlay_enabled?: boolean;
  overlay_color?: string;
  is_active?: boolean;
  sort_order?: number;
  auto_slide?: boolean;
  slide_duration?: number;
  start_date?: string;
  end_date?: string;
}

export interface BannerUpdateInput extends Partial<BannerCreateInput> {
  id: string;
}
