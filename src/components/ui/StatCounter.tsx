import React, { useEffect, useState } from 'react';
import {
  Activity,
  Award,
  CalendarDays,
  Cog,
  Factory,
  Gauge,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Drill,
} from 'lucide-react';
import { formatLocalizedNumber } from '../../utils/i18n.ts';
import type { Language } from '../../types/index.ts';

interface StatCounterProps {
  target: number;
  suffix: string;
  label: string;
  lang: Language;
  index?: number;
}

const resolveIcon = (label: string, index: number) => {
  const text = label.toLowerCase();

  if (/سال|year|سابقه|تجربه/.test(text)) return CalendarDays;
  if (/پروژه|project|طرح|contract/.test(text)) return Factory;
  if (/کیفیت|quality|تضمین|آزمون/.test(text)) return ShieldCheck;
  if (/تولید|ساخت|manufact|ماشین/.test(text)) return Cog;
  if (/رضایت|مشتری|customer/.test(text)) return Users;
  if (/درصد|percent|دقیق|accuracy/.test(text)) return Target;
  if (/رشد|growth/.test(text)) return TrendingUp;

  return [Activity, Award, Gauge, Drill][index % 4];
};

export const StatCounter: React.FC<StatCounterProps> = ({
  target,
  suffix,
  label,
  lang,
  index = 0,
}) => {
  const [value, setValue] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = document.getElementById(`industrial-stat-${index}`);

    if (!element) {
      setVisible(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [index]);

  useEffect(() => {
    if (!visible) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    let frame = 0;
    const totalFrames = 55;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(Math.min(target, Math.round(target * eased)));

      if (frame >= totalFrames) {
        setValue(target);
        window.clearInterval(timer);
      }
    }, 24);
    return () => window.clearInterval(timer);
  }, [target, visible]);

  const Icon = resolveIcon(label, index);
  return (
    <article
      id={`industrial-stat-${index}`}
      className="industrial-stat"
      data-cursor="industrial"
      style={{ '--stat-order': index } as React.CSSProperties}
    >
      <div className="industrial-stat-icon-wrap">
        <span className="industrial-stat-icon">
          <Icon size={23} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <span className="industrial-stat-icon-ring" />
      </div>

      <div className="industrial-stat-content">
        <div className="industrial-stat-number" dir="auto">
          <span className="industrial-stat-value">{formatLocalizedNumber(value, lang)}</span>
          {suffix && <span className="industrial-stat-suffix">{suffix}</span>}
        </div>
        <h3 className="industrial-stat-label">{label}</h3>
      </div>

      <div className="industrial-stat-track" aria-hidden="true">
        <span className="industrial-stat-track-line" />
        <span className="industrial-stat-track-active" />
        <span className="industrial-stat-track-dot" />
      </div>

      <span className="industrial-stat-code" dir="ltr">
        KPI / {String(index + 1).padStart(2, '0')}
      </span>
    </article>
  );
};
