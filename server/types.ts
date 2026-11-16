import type {
  ActivityLog,
  Article,
  Banner,
  ContactMessage,
  Contract,
  Department,
  KPI,
  License,
  MediaFile,
  Menu,
  NotificationItem,
  NotificationTemplate,
  PageContent,
  Partner,
  Product,
  Project,
  ProjectCategory,
  Role,
  Service,
  SiteSettings,
  Slider,
  TeamMember,
  ThemePreset,
  ThemeSettings,
  User,
} from '../src/types/index.ts';

export interface StoredUser extends User {
  password_hash: string;
  two_factor_secret?: string;
}

export interface SessionToken {
  token: string;
  user_id: number;
  expires_at: number;
}

export interface DatabaseSchema {
  initialized: boolean;
  users: StoredUser[];
  tokens: SessionToken[];
  roles: Role[];
  theme_presets: ThemePreset[];
  theme_settings: ThemeSettings;
  sliders: Slider[];
  menus: Menu[];
  project_categories: ProjectCategory[];
  projects: Project[];
  contracts: Contract[];
  licenses: License[];
  services: Service[];
  products: Product[];
  departments: Department[];
  team_members: TeamMember[];
  partners: Partner[];
  articles: Article[];
  pages: PageContent[];
  banners: Banner[];
  kpis: KPI[];
  messages: ContactMessage[];
  notifications: NotificationItem[];
  notification_templates: NotificationTemplate[];
  media: MediaFile[];
  activity_logs: ActivityLog[];
  settings: SiteSettings;
}
