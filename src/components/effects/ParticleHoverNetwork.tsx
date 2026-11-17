import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/i18n.ts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';

interface ParticleHoverNetworkProps {
  enabled?: boolean;
  density?: number;
  dotColor?: string;
  lineColor?: string;
  interactive?: boolean;
  className?: string;
}

interface NodeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

/**
 * Effect 051: Particle Hover Animation
 * Local 2D Canvas implementation matching particles.js hover grab-lines & click-push bursts (zero CDN).
 */
export const ParticleHoverNetwork: React.FC<ParticleHoverNetworkProps> = ({
  enabled = true,
  density = 36,
  dotColor = 'rgba(255, 255, 255, 0.52)',
  lineColor = '255, 255, 255',
  interactive = true,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !enabled || reducedMotion) return;

    let raf = 0;
    const pointer = { x: -1, y: -1 };
    const nodes: NodeParticle[] = [];

    const seed = () => {
      nodes.length = 0;
      const w = canvas.width;
      const h = canvas.height;
      const count = Math.max(12, Math.min(72, Math.round((w * h) / 26000) || density));
      for (let i = 0; i < count; i += 1) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.65,
          vy: (Math.random() - 0.5) * 0.65,
          r: Math.random() * 1.8 + 1.0,
        });
      }
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth || 640;
      canvas.height = canvas.offsetHeight || 360;
      seed();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const clearPointer = () => {
      pointer.x = -1;
      pointer.y = -1;
    };

    const onClick = (event: MouseEvent) => {
      if (!interactive || nodes.length > 90) return;
      const rect = canvas.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;
      for (let i = 0; i < 4; i += 1) {
        nodes.push({
          x: cx + (Math.random() - 0.5) * 18,
          y: cy + (Math.random() - 0.5) * 18,
          vx: (Math.random() - 0.5) * 1.4,
          vy: (Math.random() - 0.5) * 1.4,
          r: Math.random() * 1.8 + 1.2,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);
    const parent = canvas.parentElement;
    parent?.addEventListener('pointermove', onPointerMove);
    parent?.addEventListener('pointerleave', clearPointer);
    parent?.addEventListener('click', onClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < nodes.length; i += 1) {
        const p = nodes[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        for (let j = i + 1; j < nodes.length; j += 1) {
          const q = nodes[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 115) {
            ctx.strokeStyle = `rgba(${lineColor}, ${(1 - dist / 115) * 0.25})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        if (interactive && pointer.x >= 0) {
          const dist = Math.hypot(p.x - pointer.x, p.y - pointer.y);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(${lineColor}, ${(1 - dist / 140) * 0.55})`;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      parent?.removeEventListener('pointermove', onPointerMove);
      parent?.removeEventListener('pointerleave', clearPointer);
      parent?.removeEventListener('click', onClick);
    };
  }, [density, dotColor, enabled, interactive, lineColor, reducedMotion]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
      aria-hidden="true"
    />
  );
};
