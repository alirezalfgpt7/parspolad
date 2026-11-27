export type Language = 'fa' | 'en';
export type ColorMode = 'light' | 'dark';

export type ProjectStatus = 'completed' | 'in_progress' | 'planned' | 'contracted';
export type ContractStatus = 'active' | 'completed' | 'pending' | 'archived';
export type SlideEffect = 'fade' | 'slide' | 'zoom-in' | 'parallax' | 'ken-burns';
export type SlideTextAnimation = 'split-text' | 'typewriter' | 'fade-up' | 'mask-reveal';
export type NotificationChannel = 'email' | 'sms' | 'in_app';
export type SmsProvider = 'kavenegar' | 'smsir' | 'melipayamak';

export interface Role {
  id: number;
  name: string;
  label_fa: string;
  label_en: string;
  permissions: string[];
  users_count?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  permissions: string[];
  two_factor_enabled: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ThemePalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  headerBg: string;
  headerText: string;
  footerBg: string;
  footerText: string;
  buttonBg: string;
  buttonText: string;
  link: string;
}

export type ThemeDesignStyle = 'industrial' | 'modern' | 'glass';
export type ButtonShape = 'rounded' | 'pill' | 'square';
export type ThemeButtonEffect = 'shimmer' | 'liquid' | 'glow' | 'plain';
export type ThemeScope = 'site' | 'landing' | 'admin';
export type LandingHeaderMode = 'glass' | 'solid';

export interface LandingHeaderSettings {
  border_color: string;
  mode: LandingHeaderMode;
  radius: number;
  blur: number;
  wave_colors: [string, string, string];
  wave_bottom_color: string;
}

export interface PublicPageTitleSettings {
  background_color: string;
  title_color: string;
  subtitle_color: string;
  border_color: string;
  wave_color: string;
  wave_colors: [string, string, string];
  icon_name: string;
  icon_color: string;
  icon_background_color: string;
  radius: number;
  wave_enabled: boolean;
}

export interface ThemePreset {
  id: number;
  slug: string;
  name_fa: string;
  name_en: string;
  is_default: boolean;
  palette: ThemePalette;
  design_style: ThemeDesignStyle;
  button_shape: ButtonShape;
  button_effect: ThemeButtonEffect;
}

export interface ThemeSettings {
  active_preset_slug: string;
  default_mode: ColorMode;
  active_palette: ThemePalette;
  design_style: ThemeDesignStyle;
  button_shape: ButtonShape;
  button_effect: ThemeButtonEffect;
  landing_theme_enabled: boolean;
  landing_palette: ThemePalette;
  landing_design_style: ThemeDesignStyle;
  landing_button_shape: ButtonShape;
  landing_button_effect: ThemeButtonEffect;
  landing_header_settings: LandingHeaderSettings;
  public_page_title_settings: PublicPageTitleSettings;
  admin_palette: ThemePalette;
  admin_design_style: ThemeDesignStyle;
  admin_button_shape: ButtonShape;
  admin_button_effect: ThemeButtonEffect;
}

export interface Slide {
  id: number;
  slider_id: number;
  title_fa: string;
  title_en: string;
  subtitle_fa: string;
  subtitle_en: string;
  cta_text_fa: string;
  cta_text_en: string;
  cta_link: string;
  media_type: 'image' | 'video';
  desktop_media: string;
  mobile_media: string;
  text_position: 'right' | 'center' | 'left';
  text_color: string;
  button_color: string;
  overlay_gradient: string;
  duration_ms: number;
  effect: SlideEffect;
  text_animation: SlideTextAnimation;
  particles_enabled: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface Slider {
  id: number;
  key: string;
  title_fa: string;
  title_en: string;
  page_slug: string;
  is_active: boolean;
  slides: Slide[];
}

export interface MenuItem {
  id: number;
  menu_id: number;
  parent_id: number | null;
  title_fa: string;
  title_en: string;
  url: string;
  icon?: string | null;
  image?: string;
  description_fa?: string;
  description_en?: string;
  sort_order: number;
  is_active: boolean;
  children?: MenuItem[];
}

export interface Menu {
  id: number;
  key: 'header' | 'footer';
  title_fa: string;
  items: MenuItem[];
}

export interface ProjectCategory {
  id: number;
  slug: string;
  name_fa: string;
  name_en: string;
  icon: string;
  color: string;
  description_fa?: string | null;
}

export interface ProjectDocument {
  id?: number;
  title_fa: string;
  title_en: string;
  file_url: string;
  file_type: string;
  requires_auth: boolean;
}

export interface Project {
  id: number;
  slug: string;
  title_fa: string;
  title_en: string;
  category_id: number;
  category?: ProjectCategory;
  client_name_fa: string;
  client_name_en: string;
  contract_number: string;
  contract_type_fa: string;
  contract_type_en: string;
  location_fa: string;
  location_en: string;
  year: number;
  status: ProjectStatus;
  summary_fa: string;
  summary_en: string;
  description_fa: string;
  description_en: string;
  standards: string[];
  cover_image: string;
  images: string[];
  videos: string[];
  documents: ProjectDocument[];
  is_featured: boolean;
}

export interface Contract {
  id: number;
  contract_number: string;
  title_fa: string;
  title_en: string;
  client_fa: string;
  client_en: string;
  amount_billion_irr: number;
  start_year: number | null;
  end_year?: number | null;
  status: ContractStatus;
  scope_fa: string;
  scope_en: string;
  document_url?: string;
  requires_auth: boolean;
}

export interface License {
  id: number;
  code: string;
  title_fa: string;
  title_en: string;
  issuer_fa: string;
  issuer_en: string;
  issue_date: string;
  expiry_date?: string | null;
  category: 'iso' | 'api' | 'knowledge_based' | 'association';
  image_url: string;
  document_url?: string;
  requires_auth: boolean;
}

export interface Service {
  id: number;
  slug: string;
  title_fa: string;
  title_en: string;
  summary_fa: string;
  summary_en: string;
  description_fa: string;
  description_en: string;
  icon: string;
  image_url: string;
  sort_order: number;
}

export interface Product {
  id: number;
  slug: string;
  name_fa: string;
  name_en: string;
  category_fa: string;
  category_en: string;
  model_code: string;
  pressure_rating?: string;
  standard: string;
  summary_fa: string;
  summary_en: string;
  specs: Record<string, string> | null;
  specs_en?: Record<string, string> | null;
  image_url: string;
  catalog_url?: string;
}

export interface Department {
  id: number;
  parent_id: number | null;
  name_fa: string;
  name_en: string;
  head_name_fa: string;
  head_name_en: string;
  head_title_fa: string;
  head_title_en: string;
  color: string;
  member_count: number;
  sort_order: number;
}

export interface TeamMember {
  id: number;
  department_id: number;
  name_fa: string;
  name_en: string;
  role_fa: string;
  role_en: string;
  experience_years: number;
  email?: string;
  phone?: string;
  avatar_url?: string;
  sort_order: number;
}

export interface Partner {
  id: number;
  name_fa: string;
  name_en: string;
  logo_url: string;
  sector_fa: string;
  website?: string;
  is_active: boolean;
}

export interface Article {
  id: number;
  slug: string;
  title_fa: string;
  title_en: string;
  excerpt_fa: string;
  excerpt_en: string;
  content_fa: string;
  content_en: string;
  category_fa: string;
  category_en: string;
  article_category_id?: number | null;
  cover_image: string;
  image_fit?: 'cover' | 'fit' | 'stretch' | 'center';
  author_fa: string;
  published_at: string;
  read_minutes: number;
}

export interface PageContent {
  id: number;
  slug: string;
  title_fa: string;
  title_en: string;
  subtitle_fa: string;
  subtitle_en: string;
  content_fa: string;
  content_en: string;
  meta_title: string;
  meta_description: string;
  meta_title_en?: string | null;
  meta_description_en?: string | null;
  meta_image?: string | null;
  canonical_url?: string | null;
  metadata?: Record<string, unknown> | null;
  updated_at: string;
}

export interface Banner {
  id: number;
  title_fa: string;
  title_en: string;
  subtitle_fa: string;
  subtitle_en: string;
  cta_text_fa: string;
  cta_text_en: string;
  cta_link: string;
  image_url: string;
  placement: 'landing_mid' | 'projects_top' | 'services_bottom';
  is_active: boolean;
}

export interface KPI {
  id: number;
  key: string;
  label_fa: string;
  label_en: string;
  value: number;
  suffix_fa: string;
  suffix_en: string;
  icon?: string | null;
  background_color?: string | null;
  sort_order: number;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  company?: string;
  subject: string;
  message: string;
  type: 'contact' | 'rfq' | 'ticket';
  attachment_url?: string;
  status: 'new' | 'reviewed' | 'replied';
  admin_note?: string;
  tracking_number?: string | null;
  ticket_status?: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed' | null;
  priority?: 'low' | 'normal' | 'high' | 'urgent' | null;
  assignee_id?: number | null;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  user_id: number | null;
  title_fa: string;
  title_en: string;
  body_fa: string;
  body_en: string;
  channel: NotificationChannel;
  is_read: boolean;
  created_at: string;
}

export interface NotificationTemplate {
  id: number;
  event_key: string;
  name_fa: string;
  channel: NotificationChannel;
  subject_fa: string;
  body_html: string;
  sms_text: string;
  is_active: boolean;
}

export interface MediaFile {
  id: number;
  name: string;
  url: string;
  storage_path?: string | null;
  mime_type: string;
  extension: string;
  size_bytes: number;
  folder: string;
  requires_auth: boolean;
  source_media_id?: number | null;
  source_available?: boolean;
  variant?: string | null;
  derived_files?: MediaFile[];
  preview_url?: string | null;
  thumbnail_url?: string | null;
  optimized_preview_url?: string | null;
  alt_text?: string | null;
  description?: string | null;
  created_at: string;
}

export interface PhotoAlbumMedia {
  id: number;
  name: string;
  url: string;
  thumbnail_url?: string;
  content_url?: string | null;
  hero_url?: string | null;
  alt_text?: string | null;
  description?: string | null;
}

export interface PhotoAlbumSummary {
  id: number;
  title_fa: string;
  title_en: string;
  slug: string;
  description_fa: string | null;
  description_en: string | null;
  cover_url: string | null;
  cover_thumbnail_url: string | null;
  media_count: number;
  updated_at: string;
}

export interface PhotoAlbum {
  id: number;
  title_fa: string;
  title_en: string;
  slug: string;
  description_fa: string | null;
  description_en: string | null;
  cover_media_id: number | null;
  cover_url?: string | null;
  cover_thumbnail_url?: string | null;
  media_count?: number;
  layout: 'grid' | 'masonry' | 'mosaic' | 'slider';
  columns: number;
  rows: number;
  transition: 'fade' | 'slide' | 'zoom';
  interval_ms: number;
  image_effect: 'none' | 'zoom' | 'pan';
  card_effect: 'none' | 'lift' | 'glow';
  sort_order: number;
  is_active: boolean;
  media: PhotoAlbumMedia[];
  updated_at?: string;
}

export interface ActivityLog {
  id: number;
  user_name: string;
  user_email: string;
  action: string;
  subject_type: string;
  subject_label: string;
  ip_address: string;
  created_at: string;
}

export type FontFamilyKey =
  | 'vazirmatn'
  | 'ibm-plex-arabic'
  | 'noto-naskh'
  | 'lalezar'
  | 'plus-jakarta'
  | 'jetbrains-mono';

export interface LoginPageSettings {
  badge_text_fa: string;
  badge_text_en: string;
  title_fa: string;
  title_en: string;
  subtitle_fa: string;
  subtitle_en: string;
  two_factor_title_fa: string;
  two_factor_title_en: string;
  two_factor_hint_fa: string;
  two_factor_hint_en: string;
  email_label_fa: string;
  email_label_en: string;
  email_placeholder_fa: string;
  email_placeholder_en: string;
  password_label_fa: string;
  password_label_en: string;
  password_placeholder_fa: string;
  password_placeholder_en: string;
  captcha_label_fa: string;
  captcha_label_en: string;
  submit_text_fa: string;
  submit_text_en: string;
  two_factor_submit_fa: string;
  two_factor_submit_en: string;
  register_cta_fa: string;
  register_cta_en: string;
  back_home_fa: string;
  back_home_en: string;
  register_title_fa: string;
  register_title_en: string;
  register_subtitle_fa: string;
  register_subtitle_en: string;
  register_name_label_fa: string;
  register_name_label_en: string;
  register_phone_label_fa: string;
  register_phone_label_en: string;
  register_submit_fa: string;
  register_submit_en: string;
  login_cta_fa: string;
  login_cta_en: string;
  badge_icon: string;
  email_icon: string;
  password_icon: string;
  captcha_icon: string;
  submit_icon: string;
  register_icon: string;
  two_factor_icon: string;
  back_icon: string;
  card_bg_color: string;
  backdrop_color: string;
  accent_color: string;
  text_color: string;
  input_bg_color: string;
  enable_3d_flip: boolean;
  show_decorative_cube: boolean;
  enable_particles: boolean;
  enable_bg_slideshow: boolean;
}

export interface BrandLogosSettings {
  navbar: string;
  footer: string;
  admin_sidebar: string;
  login: string;
  register: string;
  preloader: string;
  about: string;
  favicon: string;
  seo_share: string;
}

export interface PreloaderModeSettings {
  enabled: boolean;
  display_mode: 'full' | 'background_only';
  background_color: string;
  background_image: string;
  background_overlay_opacity: number;
  show_background_media: boolean;
  remove_logo_background: boolean;
  transparent_background?: boolean;
  text_fa: string;
  text_en: string;
  text_color: string;
  logo_url: string;
  show_logo: boolean;
  show_logo_frame: boolean;
  show_spinner: boolean;
  show_text: boolean;
  show_dots: boolean;
  show_particles: boolean;
  logo_size_mobile: number;
  logo_size_tablet: number;
  logo_size_desktop: number;
  text_size_mobile: number;
  text_size_tablet: number;
  text_size_desktop: number;
}

export interface PreloaderSettings {
  initial: PreloaderModeSettings;
  internal: PreloaderModeSettings;
  initial_display_duration_ms: number;
}

export type LogoPlacement = keyof BrandLogosSettings;

export interface AppearanceSettings {
  font_site: FontFamilyKey;
  font_site_heading: FontFamilyKey;
  font_landing: FontFamilyKey;
  font_landing_heading: FontFamilyKey;
  font_login: FontFamilyKey;
  font_login_heading: FontFamilyKey;
  font_admin: FontFamilyKey;
  font_admin_heading: FontFamilyKey;
  font_navbar: FontFamilyKey;
  font_footer: FontFamilyKey;
  base_font_size: number;
}

export interface PageOverrideEntry {
  badge_fa?: string;
  badge_en?: string;
  title_fa?: string;
  title_en?: string;
  subtitle_fa?: string;
  subtitle_en?: string;
  cta_fa?: string;
  cta_en?: string;
  logo_url?: string;
  performance_eyebrow_fa?: string;
  performance_eyebrow_en?: string;
  performance_title_fa?: string;
  performance_title_en?: string;
  performance_title_accent_fa?: string;
  performance_title_accent_en?: string;
  performance_subtitle_fa?: string;
  performance_subtitle_en?: string;
  performance_footer_fa?: string;
  performance_footer_en?: string;
  performance_background_url?: string;
  performance_background_color?: string;
  performance_overlay_color?: string;
  performance_overlay_opacity?: number;
  section_background_color?: string;
  section_text_color?: string;
  section_accent_color?: string;
  section_background_url?: string;
  section_background_overlay_opacity?: number;
  products_eyebrow_fa?: string;
  products_eyebrow_en?: string;
  products_title_fa?: string;
  products_title_en?: string;
  products_background_url?: string;
  products_background_color?: string;
  products_overlay_opacity?: number;
}

export type PagesConfigSettings = Record<string, PageOverrideEntry>;

export interface SocialLinkSetting {
  id: number;
  name: string;
  url: string;
  icon: string;
  is_active: boolean;
}

export interface SiteSettings {
  company: {
    name_fa: string;
    name_en: string;
    slogan_fa: string;
    slogan_en: string;
    logo_url: string;
    logo_small_url: string;
    factory_address_fa: string;
    factory_address_en: string;
    factory_phone: string;
    factory_email: string;
    office_address_fa: string;
    office_address_en: string;
    office_phone: string;
    office_email: string;
    commercial_phone: string;
    work_hours_fa: string;
    work_hours_en: string;
    linkedin_url: string;
    instagram_url: string;
    aparat_url: string;
    telegram_url?: string;
    whatsapp_url?: string;
    footer_note_fa: string;
    footer_note_en: string;
    last_updated_fa: string;
    last_updated_en: string;
    standards_fa: string;
    standards_en: string;
  };
  map: {
    factory_lat: number;
    factory_lng: number;
    office_lat: number;
    office_lng: number;
    zoom: number;
  };
  seo: {
    site_title: string;
    meta_description: string;
    keywords: string;
    site_title_en?: string;
    meta_description_en?: string;
    keywords_en?: string;
    meta_image?: string;
    robots?: 'index,follow' | 'noindex,follow' | 'noindex,nofollow';
  };
  email: {
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    smtp_password_enc: string;
    from_address: string;
    from_name: string;
  };
  sms: {
    provider: SmsProvider;
    api_key_enc: string;
    sender_line: string;
    enabled: boolean;
  };
  site: {
    maintenance_mode: boolean;
    maintenance_message_fa: string;
    allow_registration: boolean;
    header_cta_text_fa: string;
    header_cta_text_en: string;
    header_cta_url: string;
    info_bar_enabled?: boolean;
    info_bar_phone?: string;
    info_bar_phone_enabled?: boolean;
    info_bar_phone_icon?: string;
    social_links?: SocialLinkSetting[];
  };
  login?: Partial<LoginPageSettings>;
  logos?: Partial<BrandLogosSettings>;
  appearance?: Partial<AppearanceSettings>;
  pages_config?: PagesConfigSettings;
  preloader?: Partial<PreloaderSettings>;
  logs?: {
    activity_logs_retention_months: 1 | 3 | 6 | 12;
  };
}
