import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Images, LayoutGrid, Pause, Play, SlidersHorizontal, Maximize2, X } from 'lucide-react';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { AnimatedBackground } from '../../components/effects/AnimatedBackground.tsx';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';
import { apiRequest, mediaUrl } from '../../services/api.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import type { PhotoAlbum, PhotoAlbumMedia, PhotoAlbumSummary } from '../../types/index.ts';
import './PhotoAlbumsPage.css';

interface AlbumListResponse {
  data: PhotoAlbumSummary[];
  meta: { current_page: number; last_page: number; total: number };
}

const localized = (fa: string | null | undefined, en: string | null | undefined, language: string): string =>
  language === 'fa' ? fa || en || '' : en || fa || '';

const AlbumCard: React.FC<{ album: PhotoAlbumSummary; language: string }> = ({ album, language }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const title = localized(album.title_fa, album.title_en, language);
  const description = localized(album.description_fa, album.description_en, language);

  return (
    <article className="photo-album-card group overflow-hidden rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow)">
      <Link to={`/albums/${album.slug}`} className="block">
        <div className="photo-album-card-cover relative overflow-hidden bg-(--theme-surface-muted)">
          {album.cover_thumbnail_url && !imageFailed ? (
            <img
              src={mediaUrl(album.cover_thumbnail_url)}
              alt={title}
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-(--theme-text-muted)">
              <Images className="h-10 w-10 opacity-60" aria-hidden="true" />
            </div>
          )}
          <span className="absolute bottom-3 end-3 rounded-full border border-white/30 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {album.media_count.toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US')} {language === 'fa' ? 'تصویر' : 'photos'}
          </span>
        </div>
        <div className="photo-album-card-content">
          <h2 className="photo-album-card-title font-black text-(--theme-text) transition-colors group-hover:text-(--theme-primary-ink)">{title}</h2>
          {description && <p className="mt-2 line-clamp-2 text-sm leading-7 text-(--theme-text-muted)">{description}</p>}
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-(--theme-primary-ink)">
            {language === 'fa' ? 'مشاهدهٔ آلبوم' : 'View album'}
            <ChevronLeft className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
};

const GalleryImageButton: React.FC<{
  image: PhotoAlbumMedia;
  index: number;
  effect: PhotoAlbum['image_effect'];
  cardEffect: PhotoAlbum['card_effect'];
  onOpen: () => void;
}> = ({ image, index, effect, cardEffect, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    aria-label={`${image.alt_text || image.name}، تصویر ${index + 1}`}
    className={`photo-album-image photo-album-image--${effect} photo-album-card-effect--${cardEffect} group relative block w-full overflow-hidden rounded-2xl bg-(--theme-surface-muted)`}
  >
    <img
      src={mediaUrl(image.thumbnail_url || image.url)}
      alt={image.alt_text || image.name}
      loading="lazy"
      decoding="async"
      className="h-full w-full object-cover"
    />
    <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
      <Maximize2 className="h-6 w-6 drop-shadow" aria-hidden="true" />
    </span>
  </button>
);

const AlbumGallery: React.FC<{
  album: PhotoAlbum;
  language: string;
  onOpenImage: (image: PhotoAlbumMedia) => void;
}> = ({ album, language, onOpenImage }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [viewMode, setViewMode] = useState<PhotoAlbum['layout']>(album.layout);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [lastGridMode, setLastGridMode] = useState<PhotoAlbum['layout']>(album.layout === 'slider' ? 'grid' : album.layout);
  const columns = Math.max(2, Math.min(8, album.columns));
  const initialCount = columns * Math.max(1, album.rows);
  const visibleImages = showAll ? album.media : album.media.slice(0, initialCount);
  const slider = viewMode === 'slider';

  useEffect(() => {
    if (!slider || !isPlaying || isHovered || prefersReducedMotion || album.media.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % album.media.length);
    }, album.interval_ms);
    return () => window.clearInterval(timer);
  }, [album.interval_ms, album.media.length, isHovered, isPlaying, prefersReducedMotion, slider]);

  useEffect(() => {
    if (!slider) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewMode(lastGridMode);
      if (event.key === 'ArrowLeft') setActiveIndex((index) => (index + 1) % album.media.length);
      if (event.key === 'ArrowRight') setActiveIndex((index) => (index + album.media.length - 1) % album.media.length);
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [album.media.length, lastGridMode, slider]);

  const displayModes: Array<{ value: PhotoAlbum['layout']; label: string }> = [
    { value: 'grid', label: language === 'fa' ? 'شبکه‌ای' : 'Grid' },
    { value: 'masonry', label: language === 'fa' ? 'نامنظم' : 'Masonry' },
    { value: 'mosaic', label: language === 'fa' ? 'مترو' : 'Metro' },
    { value: 'slider', label: language === 'fa' ? 'اسلایدر' : 'Slideshow' },
  ];

  return (
    <>
      <section className="space-y-5" aria-label={language === 'fa' ? 'نمایش تصاویر آلبوم' : 'Album display'}>
        {!slider && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-3 shadow-(--theme-card-shadow)">
            <div className="flex flex-wrap gap-2" role="group" aria-label={language === 'fa' ? 'حالت نمایش آلبوم' : 'Album view mode'}>
              {displayModes.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => {
                    if (mode.value !== 'slider') setLastGridMode(mode.value);
                    setViewMode(mode.value);
                  }}
                  aria-pressed={viewMode === mode.value}
                  className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${viewMode === mode.value
                    ? 'border-(--theme-primary) bg-(--theme-primary) text-(--theme-primary-foreground)'
                    : 'border-(--theme-border) bg-(--theme-surface-muted) text-(--theme-text) hover:border-(--theme-primary-ink)'}`}
                >
                  {mode.value === 'slider' ? <SlidersHorizontal className="me-1 inline h-3.5 w-3.5" aria-hidden="true" /> : <LayoutGrid className="me-1 inline h-3.5 w-3.5" aria-hidden="true" />}
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {!slider && (
          <>
            <div
              className={`photo-album-gallery photo-album-gallery--${viewMode}`}
              style={{ '--album-columns': columns } as React.CSSProperties}
            >
              {visibleImages.map((image, index) => (
                <GalleryImageButton
                  key={image.id}
                  image={image}
                  index={index}
                  effect={album.image_effect}
                  cardEffect={album.card_effect}
                  onOpen={() => onOpenImage(image)}
                />
              ))}
            </div>
            {visibleImages.length < album.media.length && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mt-6 rounded-xl border border-(--theme-border) bg-(--theme-card-surface) px-5 py-2.5 text-sm font-bold text-(--theme-text) transition hover:border-(--theme-primary-ink) hover:text-(--theme-primary-ink)"
              >
                {language === 'fa' ? `نمایش همهٔ ${album.media.length} تصویر` : `Show all ${album.media.length} photos`}
              </button>
            )}
          </>
        )}
      </section>
      {slider && createPortal(
        <div
          className={`photo-album-fullscreen photo-album-transition--${album.transition}`}
          role="dialog"
          aria-modal="true"
          aria-label={language === 'fa' ? 'نمایش تمام‌صفحهٔ آلبوم' : 'Full-screen album slideshow'}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatedBackground particles />
          <header className="photo-album-fullscreen-header">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{localized(album.title_fa, album.title_en, language)}</p>
              <p className="mt-1 text-xs text-white/60" dir="ltr">{activeIndex + 1} / {album.media.length}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying((playing) => !playing)}
                aria-pressed={isPlaying}
                className="photo-album-fullscreen-button"
                aria-label={isPlaying ? (language === 'fa' ? 'توقف پخش خودکار' : 'Pause slideshow') : (language === 'fa' ? 'ادامه پخش خودکار' : 'Resume slideshow')}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => setViewMode(lastGridMode)}
                className="photo-album-fullscreen-button"
                aria-label={language === 'fa' ? 'خروج از نمایش تمام‌صفحه' : 'Exit full screen'}
              >
                <X className="h-5 w-5" />
                <span className="hidden sm:inline">{language === 'fa' ? 'خروج' : 'Exit'}</span>
              </button>
            </div>
          </header>
          <div className="photo-album-fullscreen-stage">
            {album.media.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveIndex((activeIndex + album.media.length - 1) % album.media.length)}
                className="photo-album-fullscreen-nav photo-album-fullscreen-nav--previous"
                aria-label={language === 'fa' ? 'تصویر قبلی' : 'Previous image'}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
            <div className="photo-album-fullscreen-image-wrap">
              <img
                key={album.media[activeIndex].id}
                src={mediaUrl(album.media[activeIndex].url)}
                alt={album.media[activeIndex].alt_text || album.media[activeIndex].name}
                className={`photo-album-fullscreen-image photo-album-fullscreen-image--${album.transition}`}
              />
            </div>
            {album.media.length > 1 && (
              <button
                type="button"
                onClick={() => setActiveIndex((activeIndex + 1) % album.media.length)}
                className="photo-album-fullscreen-nav photo-album-fullscreen-nav--next"
                aria-label={language === 'fa' ? 'تصویر بعدی' : 'Next image'}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
          </div>
          <footer className="photo-album-fullscreen-footer">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="min-w-0 truncate text-xs font-semibold text-white/80">
                {album.media[activeIndex].alt_text || album.media[activeIndex].name}
              </p>
              <span className="shrink-0 text-[11px] text-white/55">{language === 'fa' ? 'تصاویر آلبوم' : 'Album frames'}</span>
            </div>
            <div className="photo-album-filmstrip" aria-label={language === 'fa' ? 'انتخاب تصویر' : 'Select image'}>
              {album.media.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={language === 'fa' ? `رفتن به تصویر ${index + 1}` : `Go to image ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  className={`photo-album-film-frame ${index === activeIndex ? 'is-active' : ''}`}
                >
                  <img src={mediaUrl(item.thumbnail_url || item.url)} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          </footer>
        </div>,
        document.body,
      )}
    </>
  );
};

export const PhotoAlbumsPage: React.FC = () => {
  const { language, addToast } = useAppStore();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const [albums, setAlbums] = useState<PhotoAlbumSummary[]>([]);
  const [album, setAlbum] = useState<PhotoAlbum | null>(null);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<PhotoAlbumMedia | null>(null);
  const isPersian = language === 'fa';
  const pageTitle = slug
    ? localized(album?.title_fa, album?.title_en, language) || (isPersian ? 'آلبوم تصاویر' : 'Photo Album')
    : isPersian ? 'آلبوم تصاویر' : 'Photo Albums';
  const seoImage = album?.media[0]?.thumbnail_url || album?.media[0]?.url;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setAlbum(null);
    setSelectedImage(null);

    const request = slug
      ? apiRequest<{ data: PhotoAlbum }>(`/albums/${encodeURIComponent(slug)}`)
          .then((response) => {
            if (active) setAlbum(response.data);
          })
      : apiRequest<AlbumListResponse>(`/albums?page=${page}&per_page=12`)
          .then((response) => {
            if (active) {
              setAlbums(response.data);
              setLastPage(response.meta.last_page);
            }
          });

    request
      .catch((error: unknown) => {
        if (active) addToast('error', error instanceof Error ? error.message : 'دریافت آلبوم‌های تصاویر ناموفق بود.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [addToast, page, slug]);

  return (
    <main className="mx-auto min-h-[65vh] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SeoHead
        title={pageTitle}
        description={isPersian
          ? 'مجموعهٔ تصاویر پروژه‌ها و فعالیت‌های پارس پولاد آقایی را در آلبوم‌های تصویری ببینید.'
          : 'Browse project and company photos in the Pars Poolad Aghaee image albums.'}
        image={seoImage ? mediaUrl(seoImage) : undefined}
        language={language}
      />
      <CmsPageIntro
        slug="albums"
        className="mb-8"
        showContent={false}
        showSeo={false}
        titleOverride={slug ? pageTitle : undefined}
        subtitleOverride={slug
          ? localized(album?.description_fa, album?.description_en, language)
            || (isPersian ? `${album?.media.length || 0} تصویر` : `${album?.media.length || 0} photos`)
          : undefined}
        badgeOverride={slug ? 'PHOTO ALBUM' : undefined}
      />
      {slug ? (
        <div className="space-y-7">
          <Link to="/albums" className="inline-flex items-center gap-2 text-sm font-semibold text-(--theme-primary-ink) hover:underline">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
            {isPersian ? 'بازگشت به آلبوم‌ها' : 'Back to albums'}
          </Link>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-4/3 animate-pulse rounded-2xl bg-(--theme-surface-muted)" />)}
            </div>
          ) : album ? (
            <>
              {album.media.length ? (
                <AlbumGallery album={album} language={language} onOpenImage={setSelectedImage} />
              ) : (
                <div className="rounded-2xl border border-dashed border-(--theme-border-strong) p-12 text-center text-sm text-(--theme-text-muted)">
                  {isPersian ? 'تصویری برای نمایش در این آلبوم موجود نیست.' : 'There are no images in this album yet.'}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-(--theme-border-strong) p-12 text-center text-sm text-(--theme-text-muted)">
              {isPersian ? 'این آلبوم پیدا نشد یا منتشر نشده است.' : 'This album was not found or is unpublished.'}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-7">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-4/3 animate-pulse rounded-2xl bg-(--theme-surface-muted)" />)}
            </div>
          ) : albums.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {albums.map((item) => <AlbumCard key={item.id} album={item} language={language} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-(--theme-border-strong) p-12 text-center text-sm text-(--theme-text-muted)">
              {isPersian ? 'هنوز آلبوم تصویری منتشر نشده است.' : 'No photo albums have been published yet.'}
            </div>
          )}
          {!loading && (
            <Pagination
              page={page}
              lastPage={lastPage}
              onChange={(nextPage) => setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) })}
            />
          )}
        </div>
      )}
      <Modal
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        title={selectedImage?.alt_text || selectedImage?.name || (isPersian ? 'تصویر' : 'Photo')}
        size="xl"
      >
        {selectedImage && (
          <img
            src={mediaUrl(selectedImage.url)}
            alt={selectedImage.alt_text || selectedImage.name}
            className="mx-auto max-h-[75vh] max-w-full object-contain"
            onError={() => addToast('error', isPersian ? 'فایل اصلی تصویر در دسترس نیست.' : 'The original image is not available.')}
          />
        )}
      </Modal>
    </main>
  );
};
