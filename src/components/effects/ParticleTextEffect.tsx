import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils/i18n.ts';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';

interface ParticleTextEffectProps {
  text: string;
  color?: string;
  height?: number;
  className?: string;
}

interface TextDot {
  x: number;
  y: number;
  ox: number;
  oy: number;
  size: number;
  alpha: number;
}

/**
 * Effect 079: Particle Text Effect
 * Renders interactive pixel-sampled wordmark dots scattering away from the pointer and springing back.
 * Uses local system/bundled fonts with accessible reduced-motion & test-safe fallback.
 */
export const ParticleTextEffect: React.FC<ParticleTextEffectProps> = ({
  text,
  color = '#38bdf8',
  height = 96,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || reducedMotion || !text.trim()) return;

    let raf = 0;
    const mouse = { x: -9999, y: -9999, radius: 64 };
    const dots: TextDot[] = [];

    const build = () => {
      dots.length = 0;
      const w = canvas.offsetWidth || 420;
      const h = height;
      canvas.width = w;
      canvas.height = h;

      const temp = document.createElement('canvas');
      const tctx = temp.getContext('2d');
      if (!tctx) return;
      temp.width = w;
      temp.height = h;

      const fontSize = Math.max(24, Math.min(48, Math.floor(w / Math.max(text.length * 0.72, 6))));
      tctx.font = `900 ${fontSize}px "Vazirmatn", "Plus Jakarta Sans", sans-serif`;
      tctx.fillStyle = '#ffffff';
      tctx.textAlign = 'center';
      tctx.textBaseline = 'middle';
      tctx.fillText(text, w / 2, h / 2);

      let data: Uint8ClampedArray;
      try {
        data = tctx.getImageData(0, 0, w, h).data;
      } catch {
        return;
      }

      const step = 3;
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const alpha = data[(y * w + x) * 4 + 3];
          if (alpha > 120) {
            dots.push({
              x: x + (Math.random() - 0.5) * 20,
              y: y + (Math.random() - 0.5) * 20,
              ox: x,
              oy: y,
              size: Math.random() * 1.1 + 1.0,
              alpha: 0.55 + Math.random() * 0.45,
            });
          }
        }
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    build();
    window.addEventListener('resize', build);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < dots.length; i += 1) {
        const d = dots[i];
        const dx = mouse.x - d.x;
        const dy = mouse.y - d.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0 && dist < mouse.radius) {
          const push = ((mouse.radius - dist) / mouse.radius) * 7.5;
          d.x -= (dx / dist) * push;
          d.y -= (dy / dist) * push;
        } else {
          d.x += (d.ox - d.x) * 0.1;
          d.y += (d.oy - d.y) * 0.1;
        }

        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', build);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, [color, height, reducedMotion, text]);

  if (reducedMotion) {
    return (
      <div
        style={{ minHeight: height, color }}
        className={cn('flex items-center justify-center text-2xl font-black tracking-tight', className)}
      >
        {text}
      </div>
    );
  }

  return (
    <div className={cn('relative w-full overflow-hidden', className)} style={{ height }}>
      <canvas ref={canvasRef} className="block h-full w-full cursor-crosshair" aria-label={text} />
      <span className="sr-only">{text}</span>
    </div>
  );
};
