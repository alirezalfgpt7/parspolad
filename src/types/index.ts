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
  description_fa?: string;
}

export interface ProjectDocument {
  id: number;
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
  start_year: number;
  end_year?: number;
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
  expiry_date?: string;
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
  specs: Record<string, string>;
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
  cover_image: string;
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
  mime_type: string;
  extension: string;
  size_bytes: number;
  folder: string;
  requires_auth: boolean;
  created_at: string;
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
  };
}
