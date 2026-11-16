import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Autoplay, EffectFade, Navigation, Pagination, Parallax } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperInstance } from 'swiper';
import { useAppStore } from '../../store/useAppStore.ts';
import type { Slide, SlideTextAnimation } from '../../types/index.ts';
import { cn } from '../../utils/i18n.ts';

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const dots = Array.from({ length: 28 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.8 + 0.8,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      for (const d of dots) {
        d.x = (d.x + d.vx + canvas.width) % canvas.width;
        d.y = (d.y + d.vy + canvas.height) % canvas.height;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" />;
};

const AnimatedHeadline: React.FC<{ text: string; mode: SlideTextAnimation; color: string; active: boolean }> = ({
  text,
  mode,
  color,
  active,
}) => {
  const [typedCount, setTypedCount] = useState(text.length);

  useEffect(() => {
    if (!active || mode !== 'typewriter') {
      setTypedCount(text.length);
      return;
    }
    setTypedCount(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTypedCount(i);
      if (i >= text.length) clearInterval(timer);
    }, 28);
    return () => clearInterval(timer);
  }, [active, mode, text]);

  if (mode === 'typewriter') {
    return (
      <h1
        style={{ color, textWrap: 'balance' }}
        className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[54px]"
      >
        {text.slice(0, typedCount)}
      </h1>
    );
  }

  if (mode === 'split-text') {
    const words = text.split(' ');
    return (
      <h1
        style={{ color, textWrap: 'balance' }}
        className="flex max-w-3xl flex-wrap gap-x-2.5 gap-y-1 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[54px]"
      >
        {words.map((word, idx) => (
          <motion.span
            key={`${word}-${idx}-${active}`}
            initial={{ opacity: 0, y: 18 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
            transition={{ duration: 0.35, delay: idx * 0.04 }}
          >
            {word}
          </motion.span>
        ))}
      </h1>
    );
  }

  if (mode === 'mask-reveal') {
    return (
      <div className="overflow-hidden">
        <motion.h1
          key={String(active)}
          initial={{ y: '100%', opacity: 0 }}
          animate={active ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ color, textWrap: 'balance' }}
          className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[54px]"
        >
          {text}
        </motion.h1>
      </div>
    );
  }

  return (
    <motion.h1
      key={String(active)}
      initial={{ opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      style={{ color, textWrap: 'balance' }}
      className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-[54px]"
    >
      {text}
    </motion.h1>
  );
};

export const HeroSlider: React.FC<{ slides: Slide[] }> = ({ slides }) => {
  const language = useAppStore((s) => s.language);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const activeSlides = slides.filter((s) => s.is_active).sort((a, b) => a.sort_order - b.sort_order);
  if (!activeSlides.length) return null;

  const currentEffect = activeSlides[activeIndex]?.effect || 'fade';
  const ArrowIcon = language === 'fa' ? ArrowLeft : ArrowRight;

  return (
    <section className="relative w-full overflow-hidden bg-slate-950">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination, Parallax]}
        effect={currentEffect === 'fade' ? 'fade' : 'slide'}
        parallax={currentEffect === 'parallax'}
        speed={750}
        loop={activeSlides.length > 1}
        autoplay={{
          delay: activeSlides[activeIndex]?.duration_ms || 6000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        onSwiper={(s) => {
          swiperRef.current = s;
        }}
        onSlideChange={(s) => setActiveIndex(s.realIndex)}
        className="h-[540px] w-full sm:h-[600px] lg:h-[640px]"
      >
        {activeSlides.map((slide, idx) => {
          const mediaSrc = isMobile && slide.mobile_media ? slide.mobile_media : slide.desktop_media;
          const title = language === 'fa' ? slide.title_fa : slide.title_en;
          const subtitle = language === 'fa' ? slide.subtitle_fa : slide.subtitle_en;
          const cta = language === 'fa' ? slide.cta_text_fa : slide.cta_text_en;
          const alignClass =
            slide.text_position === 'center'
              ? 'items-center text-center mx-auto'
              : slide.text_position === 'left'
                ? 'items-end text-end ms-auto'
                : 'items-start text-start me-auto';

          return (
            <SwiperSlide key={slide.id} className="relative h-full w-full overflow-hidden">
              {slide.media_type === 'video' && !isMobile ? (
                <video
                  src={mediaSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <img
                  src={mediaSrc}
                  alt={title}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  referrerPolicy="no-referrer"
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-transform duration-1000',
                    slide.effect === 'ken-burns' && 'animate-kenburns',
                    slide.effect === 'zoom-in' && activeIndex === idx && 'scale-105'
                  )}
                />
              )}

              <div
                className="absolute inset-0 z-10"
                style={{ background: slide.overlay_gradient }}
              />
              {slide.particles_enabled && <ParticleCanvas />}

              <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-6 sm:px-10">
                <div className={cn('flex max-w-3xl flex-col gap-5', alignClass)}>
                  <AnimatedHeadline
                    text={title}
                    mode={slide.text_animation}
                    color={slide.text_color}
                    active={activeIndex === idx}
                  />
                  <motion.p
                    key={`sub-${slide.id}-${activeIndex === idx}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={activeIndex === idx ? { opacity: 0.92, y: 0 } : { opacity: 0, y: 14 }}
                    transition={{ duration: 0.45, delay: 0.12 }}
                    style={{ color: slide.text_color }}
                    className="max-w-2xl text-sm leading-relaxed sm:text-base lg:text-lg"
                  >
                    {subtitle}
                  </motion.p>
                  {cta && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={activeIndex === idx ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ duration: 0.35, delay: 0.22 }}
                    >
                      <Link
                        to={slide.cta_link || '/projects'}
                        style={{ backgroundColor: slide.button_color || 'var(--theme-btn-bg)' }}
                        className="inline-flex items-center gap-2.5 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap"
                      >
                        <span>{cta}</span>
                        <ArrowIcon className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {activeSlides.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 mx-auto flex max-w-7xl -translate-y-1/2 justify-between px-4">
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-xs transition-colors hover:bg-black/60"
            aria-label="اسلاید قبل"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-xs transition-colors hover:bg-black/60"
            aria-label="اسلاید بعد"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
};
