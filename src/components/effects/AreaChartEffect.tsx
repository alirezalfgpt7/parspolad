import React, { useId, useState } from 'react';
import { cn } from '../../utils/i18n.ts';
import './AreaChartEffect.css';

export interface AreaChartDatum {
  label: string;
  value: number;
}

interface AreaChartEffectProps {
  data: AreaChartDatum[];
  height?: number;
  unitLabel?: string;
  className?: string;
}

function buildSmoothSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

/**
 * Effect 045: Local Smooth Gradient Area Chart (zero CDN, pure React + SVG)
 */
export const AreaChartEffect: React.FC<AreaChartEffectProps> = ({
  data,
  height = 200,
  unitLabel = '',
  className,
}) => {
  const gradientId = useId();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) return null;

  const width = 480;
  const padX = 36;
  const padTop = 26;
  const padBottom = 30;
  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? (width - padX * 2) / (data.length - 1) : 0;

  const pts = data.map((d, i) => ({
    x: padX + i * stepX,
    y: height - padBottom - (d.value / maxVal) * (height - padTop - padBottom),
    ...d,
  }));

  const linePath = buildSmoothSvgPath(pts);
  const firstPt = pts[0];
  const lastPt = pts[pts.length - 1];
  const baseY = height - padBottom;
  const areaPath = `${linePath} L ${lastPt.x} ${baseY} L ${firstPt.x} ${baseY} Z`;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((ratio) => baseY - ratio * (height - padTop - padBottom));

  return (
    <div className={cn('effect-area-chart-card overflow-x-auto', className)}>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-52 w-full tabular-nums">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--theme-primary)" stopOpacity="0.68" />
            <stop offset="90%" stopColor="var(--theme-primary)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--theme-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((yPos, idx) => (
          <line
            key={idx}
            x1={padX}
            y1={yPos}
            x2={width - padX}
            y2={yPos}
            stroke="currentColor"
            strokeDasharray={idx === 0 ? undefined : '3 4'}
            className="text-slate-200 dark:text-slate-800"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} className="effect-area-chart-fill" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--theme-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          className="effect-area-chart-path"
        />

        {pts.map((pt, idx) => {
          const active = hoveredIdx === idx;
          return (
            <g
              key={`${pt.label}-${idx}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {active && (
                <line
                  x1={pt.x}
                  y1={padTop}
                  x2={pt.x}
                  y2={baseY}
                  stroke="var(--theme-primary)"
                  strokeOpacity="0.35"
                  strokeDasharray="3 3"
                />
              )}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={active ? 6.5 : 4.5}
                fill="var(--theme-primary)"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={pt.y - 11}
                textAnchor="middle"
                className="fill-slate-800 text-[11px] font-bold dark:fill-slate-100"
              >
                {pt.value}{active && unitLabel ? ` ${unitLabel}` : ''}
              </text>
              <text
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-500 text-[10.5px] dark:fill-slate-400"
              >
                {pt.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
