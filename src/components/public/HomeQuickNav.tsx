import React, { useEffect, useState } from 'react';
import { BriefcaseBusiness, Cog, Factory, Gauge, Handshake, House, Newspaper } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';
import './HomeQuickNav.css';

interface QuickNavItem {
  id: string;
  labelFa: string;
  labelEn: string;
  icon: React.ReactNode;
}

const items: QuickNavItem[] = [
  {
    id: 'home-slider',
    labelFa: 'خانه',
    labelEn: 'Home',
    icon: <House strokeWidth={1.8} />,
  },
  {
    id: 'home-performance',
    labelFa: 'شاخص‌ها',
    labelEn: 'Performance',
    icon: <Gauge strokeWidth={1.8} />,
  },
  {
    id: 'home-capabilities',
    labelFa: 'توانمندی‌ها',
    labelEn: 'Capabilities',
    icon: <Cog strokeWidth={1.8} />,
  },
  {
    id: 'home-spotlight',
    labelFa: 'معرفی',
    labelEn: 'Overview',
    icon: <Factory strokeWidth={1.8} />,
  },
  {
    id: 'home-projects',
    labelFa: 'پروژه‌ها',
    labelEn: 'Projects',
    icon: <BriefcaseBusiness strokeWidth={1.8} />,
  },
  {
    id: 'home-partners',
    labelFa: 'همکاران',
    labelEn: 'Partners',
    icon: <Handshake strokeWidth={1.8} />,
  },
  {
    id: 'home-news',
    labelFa: 'اخبار',
    labelEn: 'News',
    icon: <Newspaper strokeWidth={1.8} />,
  },
];

export const HomeQuickNav: React.FC = () => {
  const language = useAppStore((state) => state.language);
  const isFa = language === 'fa';
  const [activeId, setActiveId] = useState(items[0].id);
  const scrollToSection = (section: HTMLElement) => {
    const headerHeight = document
      .querySelector<HTMLElement>('.public-header-shell')
      ?.getBoundingClientRect().height ?? 0;
    const top = section.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveId(visible.target.id);
    }, {
      rootMargin: '-25% 0px -55% 0px',
      threshold: [0.05, 0.15, 0.3, 0.5],
    });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hashId = window.location.hash.slice(1);
    if (!items.some((item) => item.id === hashId)) return;

    setActiveId(hashId);
    const frame = window.requestAnimationFrame(() => {
      const section = document.getElementById(hashId);
      if (section) scrollToSection(section);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const navigateTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const section = document.getElementById(id);
    if (!section) return;

    event.preventDefault();
    window.history.pushState(null, '', `#${id}`);
    setActiveId(id);
    scrollToSection(section);
  };

  return (
    <nav
      className="home-quick-nav"
      dir={isFa ? 'rtl' : 'ltr'}
      aria-label={isFa ? 'ناوبری بخش‌های صفحه اصلی' : 'Homepage section navigation'}
    >
      <div className="home-quick-nav-list">
        {items.map((item, index) => {
          const active = activeId === item.id;
          const label = isFa ? item.labelFa : item.labelEn;

          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="home-quick-nav-tab"
              data-active={active}
              data-index={index + 1}
              aria-current={active ? 'location' : undefined}
              aria-label={`${item.labelFa} — ${item.labelEn}`}
              onClick={(event) => navigateTo(event, item.id)}
            >
              <span className="home-quick-nav-icon">
                {item.icon}
              </span>

              <span className="home-quick-nav-copy">
                <span className="home-quick-nav-title">{label}</span>
                <span className="home-quick-nav-subtitle">
                  {isFa ? item.labelEn : item.labelFa}
                </span>
              </span>

              <span className="home-quick-nav-active-mark" aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </nav>
  );
};
