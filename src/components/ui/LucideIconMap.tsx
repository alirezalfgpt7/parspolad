import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  Building2,
  CheckCircle2,
  Clapperboard,
  Compass,
  Cpu,
  Eye,
  FileCheck2,
  Fingerprint,
  Flame,
  FolderKanban,
  Globe,
  HelpCircle,
  Home,
  Instagram,
  KeyRound,
  Layers,
  Linkedin,
  Lock,
  LogIn,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Settings,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  UserCheck,
  UserPlus,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

export const LUCIDE_ICON_REGISTRY: Record<string, { icon: LucideIcon; label: string }> = {
  ShieldCheck: { icon: ShieldCheck, label: 'سپر امنیتی' },
  Lock: { icon: Lock, label: 'قفل' },
  KeyRound: { icon: KeyRound, label: 'کلید' },
  Mail: { icon: Mail, label: 'ایمیل' },
  LogIn: { icon: LogIn, label: 'ورود' },
  UserPlus: { icon: UserPlus, label: 'ثبت‌نام' },
  UserCheck: { icon: UserCheck, label: 'تایید کاربر' },
  Fingerprint: { icon: Fingerprint, label: 'اثر انگشت' },
  ArrowRight: { icon: ArrowRight, label: 'فلش راست' },
  ArrowLeft: { icon: ArrowLeft, label: 'فلش چپ' },
  Shield: { icon: Shield, label: 'سپر' },
  Sparkles: { icon: Sparkles, label: 'درخشش' },
  Award: { icon: Award, label: 'گواهینامه' },
  Building2: { icon: Building2, label: 'ساختمان سازمانی' },
  CheckCircle2: { icon: CheckCircle2, label: 'تایید' },
  Compass: { icon: Compass, label: 'قطب‌نما' },
  Cpu: { icon: Cpu, label: 'پردازشگر' },
  Eye: { icon: Eye, label: 'مشاهده' },
  FileCheck2: { icon: FileCheck2, label: 'سند تایید شده' },
  Flame: { icon: Flame, label: 'مشعل انرژی' },
  Globe: { icon: Globe, label: 'بین‌المللی' },
  Home: { icon: Home, label: 'خانه' },
  Layers: { icon: Layers, label: 'لایه‌ها' },
  Phone: { icon: Phone, label: 'تلفن' },
  Settings: { icon: Settings, label: 'تنظیمات' },
  Smartphone: { icon: Smartphone, label: 'موبایل' },
  Star: { icon: Star, label: 'ستاره' },
  Wrench: { icon: Wrench, label: 'آچار مهندسی' },
  Zap: { icon: Zap, label: 'انرژی' },
  Bell: { icon: Bell, label: 'اعلان' },
  Clapperboard: { icon: Clapperboard, label: 'آپارات و ویدئو' },
  FolderKanban: { icon: FolderKanban, label: 'پروژه‌ها' },
  HelpCircle: { icon: HelpCircle, label: 'پرسش و پاسخ' },
  Instagram: { icon: Instagram, label: 'اینستاگرام' },
  Linkedin: { icon: Linkedin, label: 'لینکدین' },
  MessageCircle: { icon: MessageCircle, label: 'پیام‌رسان' },
  WhatsApp: { icon: MessageCircle, label: 'واتساپ' },
  Send: { icon: Send, label: 'تلگرام و ارسال' },
};

interface DynamicLucideIconProps {
  name?: string;
  fallback?: string;
  className?: string;
}

export const DynamicLucideIcon: React.FC<DynamicLucideIconProps> = ({
  name,
  fallback = 'ShieldCheck',
  className = 'h-4 w-4',
}) => {
  const entry = (name && LUCIDE_ICON_REGISTRY[name]) || LUCIDE_ICON_REGISTRY[fallback] || LUCIDE_ICON_REGISTRY.ShieldCheck;
  const Icon = entry.icon;
  return <Icon className={className} aria-hidden="true" />;
};
