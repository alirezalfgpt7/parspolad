import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Slide, SlideTextAnimation } from '../../types/index.ts';
import { cn } from '../../utils/i18n.ts';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';
import { EffectAction, ParticleHoverNetwork, WaveHeroEffect } from '../effects/index.ts';

const isVideoMedia = (src: string): boolean => /\.(mp4|webm|ogv|ogg)(?:$|[?#])/i.test(src);

const AnimatedHeadline: React.FC<{
  text: string;
  mode: SlideTextAnimation;
  color: string;
  active: boolean;
  reducedMotion: boolean;
}> = ({ text, mode, color, active, reducedMotion }) => {
  const [typedCount, setTypedCount] = useState(text.length);

  useEffect(() => {
    if (!active || mode !== 'typewriter' || reducedMotion) {
      setTypedCount(text.length);
      return;
    }

    setTypedCount(0);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedCount(index);
      if (index >= text.length) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [active, mode, reducedMotion, text]);

  if (mode === 'split-text') {
    return (
      <h1
        key={`${text}-${active}`}
        data-animation={mode}
        style={{ color, textWrap: 'balance' }}
        className="effect-hero-title flex max-w-3xl flex-wrap gap-x-2.5 gap-y-1 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[54px]"
      >
        {text.split(' ').map((word, index) => (
          <span key={`${word}-${index}`} style={{ animationDelay: `${index * 40}ms` }}>
            {word}
          </span>
        ))}
      </h1>
    );
  }

  return (
    <h1
      key={`${text}-${active}`}
      data-animation={mode}
      style={{ color, textWrap: 'balance' }}
      className="effect-hero-title max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[54px]"
    >
      {mode === 'typewriter' ? text.slice(0, typedCount) : text}
    </h1>
  );
};

export const HeroSlider: React.FC<{ slides: Slide[] }> = ({ slides }) => {
  const language = useAppStore((state) => state.language);
  const shouldReduceMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );
  const [isPaused, setIsPaused] = useState(false);
  const activeSlides = useMemo(
    () => slides.filter((slide) => slide.is_active).sort((a, b) => a.sort_order - b.sort_order),
    [slides],
  );
  const selectedSlide = activeSlides[activeIndex];
  const ArrowIcon = language === 'fa' ? ArrowLeft : ArrowRight;
  const PreviousSlideIcon = language === 'fa' ? ChevronRight : ChevronLeft;
  const NextSlideIcon = language === 'fa' ? ChevronLeft : ChevronRight;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (activeSlides.length < 2 || shouldReduceMotion || isPaused) return;
    const duration = Math.max(3000, selectedSlide?.duration_ms || 6000);
    const timer = window.setTimeout(
      () => setActiveIndex((index) => (index + 1) % activeSlides.length),
      duration,
    );
    return () => window.clearTimeout(timer);
  }, [activeIndex, activeSlides, isPaused, selectedSlide?.duration_ms, shouldReduceMotion]);

  useEffect(() => {
    if (activeIndex >= activeSlides.length) setActiveIndex(0);
  }, [activeIndex, activeSlides.length]);

  if (!activeSlides.length) return null;

  const moveSlide = (direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + activeSlides.length) % activeSlides.length);
  };

  return (
    <section
      className="relative h-135 w-full overflow-hidden bg-slate-950 sm:h-150 lg:h-160"
      aria-roledescription="carousel"
      aria-label={language === 'fa' ? 'اسلایدر صفحه' : 'Page slider'}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
    >
      {activeSlides.map((slide, index) => {
        const active = activeIndex === index;
        const hasMobileMedia = isMobile && Boolean(slide.mobile_media);
        const mediaSrc = hasMobileMedia ? slide.mobile_media : slide.desktop_media;
        const showVideo = isVideoMedia(mediaSrc);
        const videoPoster = isMobile && slide.mobile_media && !isVideoMedia(slide.mobile_media)
          ? slide.mobile_media
          : '/images/hero/slide-1.jpg';
        const title = language === 'fa' ? slide.title_fa : slide.title_en;
        const subtitle = language === 'fa' ? slide.subtitle_fa : slide.subtitle_en;
        const cta = language === 'fa' ? slide.cta_text_fa : slide.cta_text_en;
        const alignClass = slide.text_position === 'center'
          ? 'items-center text-center mx-auto'
          : slide.text_position === 'left'
            ? 'items-end text-end ms-auto'
            : 'items-start text-start me-auto';

        return (
          <div
            key={slide.id}
            className="effect-hero-slide"
            data-active={active}
            data-transition={slide.effect}
            aria-hidden={!active}
          >
            {showVideo && active && !shouldReduceMotion ? (
              <video
                src={mediaSrc}
                poster={videoPoster}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
                className="effect-hero-media absolute inset-0 h-full w-full object-cover"
              />
            ) : showVideo ? (
              <ZeroBrokenImage
                src={videoPoster}
                alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
                className="effect-hero-media absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <ZeroBrokenImage
                src={mediaSrc}
                alt=""
                loading={index === 0 ? 'eager' : 'lazy'}
                className="effect-hero-media absolute inset-0 h-full w-full object-cover"
              />
            )}

            <div className="absolute inset-0 z-10" style={{ background: slide.overlay_gradient }} />
            <ParticleHoverNetwork enabled={active && slide.particles_enabled && !shouldReduceMotion} className="z-10" />

            <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-10">
              <div className={cn('effect-hero-copy flex max-w-3xl flex-col gap-5', alignClass)}>
                <AnimatedHeadline
                  text={title}
                  mode={slide.text_animation}
                  color={slide.text_color}
                  active={active}
                  reducedMotion={shouldReduceMotion}
                />
                <p
                  style={{ color: slide.text_color, animationDelay: '80ms' }}
                  className="max-w-2xl text-sm leading-relaxed sm:text-base lg:text-lg"
                >
                  {subtitle}
                </p>
                {cta && (
                  <EffectAction
                    as={Link}
                    to={slide.cta_link || '/projects'}
                    style={{
                      backgroundColor: slide.button_color || 'var(--theme-btn-bg)',
                      color: 'var(--theme-btn-text)',
                    }}
                    effects={['shimmer']}
                    className="inline-flex items-center gap-2.5 rounded-lg px-6 py-3 text-sm font-semibold shadow-md transition-transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <span>{cta}</span>
                    <ArrowIcon className="h-4 w-4" />
                  </EffectAction>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20">
        <WaveHeroEffect
          bottomFill="color-mix(in srgb, var(--theme-bg) 84%, #38bdf8)"
          tintRgb="125 211 252"
        />
      </div>

      {activeSlides.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 mx-auto flex max-w-7xl -translate-y-1/2 justify-between px-4">
            <button
              type="button"
              onClick={() => moveSlide(-1)}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-xs transition-colors hover:bg-black/60"
              aria-label={language === 'fa' ? 'اسلاید قبل' : 'Previous slide'}
            >
              <PreviousSlideIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => moveSlide(1)}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-xs transition-colors hover:bg-black/60"
              aria-label={language === 'fa' ? 'اسلاید بعد' : 'Next slide'}
            >
              <NextSlideIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-5 z-30 flex justify-center gap-2" role="group" aria-label={language === 'fa' ? 'انتخاب اسلاید' : 'Choose slide'}>
            {activeSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={language === 'fa' ? `اسلاید ${index + 1}` : `Slide ${index + 1}`}
                aria-current={activeIndex === index ? 'true' : undefined}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  activeIndex === index ? 'w-8' : 'w-3',
                )}
                style={{
                  backgroundColor: activeIndex === index
                    ? 'var(--theme-primary)'
                    : 'color-mix(in srgb, var(--theme-primary) 45%, transparent)',
                }}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
