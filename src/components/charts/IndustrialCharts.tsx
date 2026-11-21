import React from 'react';
import { AreaChartEffect } from '../effects/index.ts';

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
              <span className="font-medium text-(--theme-text-muted)">{item.name}</span>
              <span className="font-bold text-(--theme-text)">{item.count} پروژه</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-(--theme-surface-muted)">
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

export const YearlyTrendChart: React.FC<{ data: YearChartItem[] }> = ({ data }) => (
  <AreaChartEffect
    data={data.map((item) => ({ label: item.year, value: item.count }))}
    unitLabel="پروژه"
  />
);
