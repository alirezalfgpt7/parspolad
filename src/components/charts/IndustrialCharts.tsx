import React from 'react';

interface CategoryChartItem {
  name: string;
  color: string;
  count: number;
}

interface YearChartItem {
  year: string;
  count: number;
}

export const CategoryBarChart: React.FC<{ data: CategoryChartItem[] }> = ({ data }) => {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="space-y-3.5 tabular-nums">
      {data.map((item) => {
        const pct = Math.round((item.count / max) * 100);
        return (
          <div key={item.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 dark:text-slate-200">{item.name}</span>
              <span className="font-bold text-slate-900 dark:text-white">{item.count} پروژه</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="effect-chart-bar h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: item.color || 'var(--theme-primary)' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const YearlyTrendChart: React.FC<{ data: YearChartItem[] }> = ({ data }) => {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 460;
  const height = 180;
  const padX = 36;
  const padY = 24;
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = height - padY - (d.count / max) * (height - padY * 2);
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `${padX},${height - padY} ${polyline} ${padX + (data.length - 1) * stepX},${height - padY}`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full tabular-nums">
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
        <polygon className="effect-chart-area" points={area} fill="url(#trendGrad)" />
        <polyline className="effect-chart-line" fill="none" stroke="var(--theme-primary)" strokeWidth="2.5" strokeLinejoin="round" points={polyline} />
        {points.map((p) => (
          <g key={p.year}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="var(--theme-primary)" stroke="#FFFFFF" strokeWidth="2" />
            <text x={p.x} y={p.y - 10} textAnchor="middle" className="fill-slate-700 text-[11px] font-bold dark:fill-slate-200">
              {p.count}
            </text>
            <text x={p.x} y={height - 6} textAnchor="middle" className="fill-slate-500 text-[11px] dark:fill-slate-400">
              {p.year}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
