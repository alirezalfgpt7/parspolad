import React, { useEffect, useState } from 'react';
import { Clock3 } from 'lucide-react';

interface PersianClockBadgeProps {
  className?: string;
}

const dateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Tehran',
});

const timeFormatter = new Intl.DateTimeFormat('fa-IR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Tehran',
});

export const PersianClockBadge: React.FC<PersianClockBadgeProps> = ({ className = '' }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const date = dateFormatter.format(now);
  const time = timeFormatter.format(now);

  return (
    <div
      className={`inline-flex h-8 min-w-0 items-center gap-1.5 rounded-lg border border-current/15 bg-current/5 px-2.5 text-[10px] text-inherit ${className}`}
      aria-label={`${date}، ساعت ${time} به وقت تهران`}
    >
      <Clock3 className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
      <time dateTime={now.toISOString()} dir="ltr" className="shrink-0 font-semibold tabular-nums">{time}</time>
      <span aria-hidden="true" className="h-3 border-s border-current/20" />
      <time dateTime={now.toISOString()} className="truncate whitespace-nowrap">{date}</time>
    </div>
  );
};
