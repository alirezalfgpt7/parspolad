import React, { useEffect, useRef } from 'react';
import { Crosshair, MousePointer2, Target } from 'lucide-react';
import './CustomCursor.css';

export type CustomCursorVariant = 'industrial' | 'pointer' | 'crosshair';

const CURSOR_ICONS = {
  industrial: Crosshair,
  pointer: MousePointer2,
  crosshair: Target,
} satisfies Record<CustomCursorVariant, React.ElementType>;

const isCursorVariant = (value: string | undefined): value is CustomCursorVariant =>
  value === 'industrial' || value === 'pointer' || value === 'crosshair';

const getCursorTarget = (
  node: EventTarget | null,
): { element: HTMLElement; variant: CustomCursorVariant } | null => {
  if (!(node instanceof Element)) return null;

  const element = node.closest<HTMLElement>('[data-cursor]');
  const variant = element?.dataset.cursor;
  if (!element || !isCursorVariant(variant)) return null;

  return { element, variant };
};

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const activeTargetRef = useRef<HTMLElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pointerPositionRef = useRef({ x: 0, y: 0 });
  const cursorPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!supportsFinePointer || prefersReducedMotion) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    document.documentElement.dataset.customCursorEnabled = 'true';

    const hideCursor = () => {
      activeTargetRef.current = null;
      cursor.dataset.visible = 'false';
      delete cursor.dataset.pressed;
    };

    const updateTarget = (node: EventTarget | null) => {
      const target = getCursorTarget(node);
      if (!target) {
        hideCursor();
        return;
      }

      activeTargetRef.current = target.element;
      cursor.dataset.variant = target.variant;
      cursor.dataset.visible = 'true';
    };

    const renderPosition = () => {
      const current = cursorPositionRef.current;
      const target = pointerPositionRef.current;
      const deltaX = target.x - current.x;
      const deltaY = target.y - current.y;

      current.x += deltaX * 0.32;
      current.y += deltaY * 0.32;
      cursor.style.setProperty('--cursor-x', `${current.x}px`);
      cursor.style.setProperty('--cursor-y', `${current.y}px`);

      if (Math.abs(deltaX) > 0.35 || Math.abs(deltaY) > 0.35) {
        animationFrameRef.current = window.requestAnimationFrame(renderPosition);
      } else {
        current.x = target.x;
        current.y = target.y;
        cursor.style.setProperty('--cursor-x', `${target.x}px`);
        cursor.style.setProperty('--cursor-y', `${target.y}px`);
        animationFrameRef.current = null;
      }
    };

    const schedulePositionUpdate = () => {
      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(renderPosition);
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const wasHidden = cursor.dataset.visible !== 'true';
      updateTarget(event.target);
      if (activeTargetRef.current && wasHidden) {
        pointerPositionRef.current = { x: event.clientX, y: event.clientY };
        cursorPositionRef.current = { x: event.clientX, y: event.clientY };
        cursor.style.setProperty('--cursor-x', `${event.clientX}px`);
        cursor.style.setProperty('--cursor-y', `${event.clientY}px`);
      }
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;

      const target = getCursorTarget(event.relatedTarget);
      if (target) {
        updateTarget(event.relatedTarget);
      } else {
        hideCursor();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        hideCursor();
        return;
      }
      if (!activeTargetRef.current) return;

      pointerPositionRef.current = { x: event.clientX, y: event.clientY };
      schedulePositionUpdate();
    };

    const handlePointerDown = () => {
      if (activeTargetRef.current) cursor.dataset.pressed = 'true';
    };

    const handlePointerUp = () => {
      delete cursor.dataset.pressed;
    };

    document.addEventListener('pointerover', handlePointerOver);
    document.addEventListener('pointerout', handlePointerOut);
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.documentElement.removeAttribute('data-custom-cursor-enabled');
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointercancel', handlePointerUp);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div ref={cursorRef} className="custom-cursor" data-visible="false" aria-hidden="true">
      <span className="custom-cursor__visual">
        <span className="custom-cursor__orbit" />
        {Object.entries(CURSOR_ICONS).map(([variant, Icon]) => (
          <Icon key={variant} className="custom-cursor__icon" data-cursor-icon={variant} />
        ))}
      </span>
    </div>
  );
};
