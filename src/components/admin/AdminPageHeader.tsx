import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AdminPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  eyebrow?: string;
  actions?: React.ReactNode;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  icon: Icon,
  title,
  description,
  eyebrow,
  actions,
}) => (
  <header className="flex flex-col gap-5 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-5 shadow-(--theme-card-shadow) sm:p-6 lg:flex-row lg:items-center lg:justify-between">
    <div className="flex min-w-0 items-start gap-4 lg:flex-1">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-(--theme-primary)/10 text-(--theme-primary-ink)">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-(--theme-primary-ink)">{eyebrow}</p>}
        <h1 className="mt-1 text-xl font-black text-(--theme-text) sm:text-2xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-(--theme-text-muted)">{description}</p>}
      </div>
    </div>
    {actions && <div className="flex min-w-0 flex-wrap items-center gap-2 lg:flex-1 lg:justify-end [&_a]:min-h-11 [&_button]:min-h-11">{actions}</div>}
  </header>
);
