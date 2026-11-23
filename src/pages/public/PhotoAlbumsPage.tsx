import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Images, LayoutGrid, Pause, Play, SlidersHorizontal, Maximize2 } from 'lucide-react';
import { CmsPageIntro } from '../../components/common/CmsPageIntro.tsx';
import { SeoHead } from '../../components/common/SeoHead.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Pagination } from '../../components/ui/Pagination.tsx';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts';
import { apiRequest, apiUrl } from '../../services/api.ts';
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
    <article className="photo-album-card group overflow-hidden rounded-3xl border border-(--theme-card-border) bg-(--theme-card-surface) shadow-(--theme-card-shadow)">
      <Link to={`/albums/${album.slug}`} className="block">
        <div className="relative aspect-16/10 overflow-hidden bg-(--theme-surface-muted)">
          {album.cover_thumbnail_url && !imageFailed ? (
            <img
              src={apiUrl(album.cover_thumbnail_url)}
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
        <div className="p-5">
          <h2 className="text-lg font-black text-(--theme-text) transition-colors group-hover:text-(--theme-primary-ink)">{title}</h2>
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
      src={apiUrl(image.thumbnail_url || image.url)}
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

  const displayModes: Array<{ value: PhotoAlbum['layout']; label: string }> = [
    { value: 'grid', label: language === 'fa' ? 'شبکه‌ای' : 'Grid' },
    { value: 'masonry', label: language === 'fa' ? 'نامنظم' : 'Masonry' },
    { value: 'mosaic', label: language === 'fa' ? 'مترو' : 'Metro' },
    { value: 'slider', label: language === 'fa' ? 'اسلایدر' : 'Slideshow' },
  ];

  return (
    <section className="space-y-5" aria-label={language === 'fa' ? 'نمایش تصاویر آلبوم' : 'Album display'}>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-(--theme-card-border) bg-(--theme-card-surface) p-3 shadow-(--theme-card-shadow)">
        <div className="flex flex-wrap gap-2" role="group" aria-label={language === 'fa' ? 'حالت نمایش آلبوم' : 'Album view mode'}>
          {displayModes.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setViewMode(mode.value)}
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
        {slider && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-(--theme-text-muted)" dir="ltr">
              {activeIndex + 1} / {album.media.length}
            </span>
            <button
              type="button"
              onClick={() => setIsPlaying((playing) => !playing)}
              aria-pressed={isPlaying}
              className="inline-flex items-center gap-2 rounded-xl border border-(--theme-border) bg-(--theme-surface-muted) px-3 py-2 text-xs font-bold text-(--theme-text) transition hover:border-(--theme-primary-ink)"
            >
              {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {isPlaying ? (language === 'fa' ? 'توقف اسلاید' : 'Pause') : (language === 'fa' ? 'ادامه اسلاید' : 'Play')}
            </button>
          </div>
        )}
      </div>

      {slider ? (
        <div
          className={`photo-album-slider photo-album-card-effect--${album.card_effect} photo-album-transition--${album.transition}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-(--theme-card-border) bg-(--theme-surface-muted) shadow-(--theme-card-shadow)">
            <button
              type="button"
              onClick={() => onOpenImage(album.media[activeIndex])}
              className="block aspect-16/9 w-full"
              aria-label={language === 'fa' ? 'نمایش تصویر در اندازهٔ اصلی' : 'View image at full size'}
            >
              <img
                key={album.media[activeIndex].id}
                src={apiUrl(album.media[activeIndex].url)}
                alt={album.media[activeIndex].alt_text || album.media[activeIndex].name}
                className={`photo-album-slide-image photo-album-image--${album.image_effect}`}
              />
            </button>
            <span className="absolute bottom-4 end-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm" dir="ltr">
              {activeIndex + 1} / {album.media.length}
            </span>
            {album.media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveIndex((activeIndex + album.media.length - 1) % album.media.length)}
                  className="absolute start-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/55 text-white transition hover:bg-black/75"
                  aria-label={language === 'fa' ? 'تصویر قبلی' : 'Previous image'}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((activeIndex + 1) % album.media.length)}
                  className="absolute end-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-black/55 text-white transition hover:bg-black/75"
                  aria-label={language === 'fa' ? 'تصویر بعدی' : 'Next image'}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
              </>
            )}
          </div>
          {album.media.length > 1 && (
            <div className="mt-3 flex justify-center gap-2 overflow-x-auto py-1" aria-label={language === 'fa' ? 'انتخاب تصویر اسلایدر' : 'Select slide'}>
              {album.media.slice(0, 8).map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={language === 'fa' ? `رفتن به تصویر ${index + 1}` : `Go to image ${index + 1}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${index === activeIndex ? 'border-(--theme-primary)' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={apiUrl(item.thumbnail_url || item.url)} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
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
        image={seoImage ? apiUrl(seoImage) : undefined}
        language={language}
      />
      <CmsPageIntro
        slug="albums"
        className="mb-0"
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-4/3 animate-pulse rounded-2xl bg-(--theme-surface-muted)" />)}
            </div>
          ) : albums.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            src={apiUrl(selectedImage.url)}
            alt={selectedImage.alt_text || selectedImage.name}
            className="mx-auto max-h-[75vh] max-w-full object-contain"
            onError={() => addToast('error', isPersian ? 'فایل اصلی تصویر در دسترس نیست.' : 'The original image is not available.')}
          />
        )}
      </Modal>
    </main>
  );
};
