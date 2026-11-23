import React, { useEffect, useRef, useState } from 'react';
import { Film, Image as ImageIcon } from 'lucide-react';
import { apiBlob, mediaUrl } from '../../services/api.ts';

interface MediaThumbnailProps {
  mediaId: number;
  alt: string;
  isVideo: boolean;
  originalUrl?: string;
}

export const MediaThumbnail: React.FC<MediaThumbnailProps> = ({ mediaId, alt, isVideo, originalUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [usingOriginal, setUsingOriginal] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return undefined;

    let active = true;
    let objectUrl: string | null = null;
    void apiBlob(`/admin/media/${mediaId}/thumbnail`)
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (active) setSource(objectUrl);
        else URL.revokeObjectURL(objectUrl);
      })
      .catch(() => {
        if (active && originalUrl) {
          setUsingOriginal(true);
          setSource(mediaUrl(originalUrl));
        } else if (active) {
          setFailed(true);
        }
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isVideo, mediaId, originalUrl, visible]);

  const handlePreviewError = () => {
    if (originalUrl && !usingOriginal) {
      setUsingOriginal(true);
      setSource(mediaUrl(originalUrl));
      return;
    }

    setFailed(true);
    setSource(null);
  };

  return (
    <div ref={containerRef} className="flex h-full w-full items-center justify-center overflow-hidden">
      {source ? (
        isVideo && usingOriginal ? (
          <video
            src={source}
            aria-label={alt}
            preload="metadata"
            muted
            playsInline
            onError={handlePreviewError}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={source}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={handlePreviewError}
            className="h-full w-full object-contain"
          />
        )
      ) : (
        <div className="flex flex-col items-center gap-1 text-(--theme-text-muted)" aria-label={failed ? 'پیش‌نمایش موجود نیست' : 'در حال بارگیری بندانگشتی'}>
          {isVideo ? <Film className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
          {failed && <span className="text-[10px]">پیش‌نمایش موجود نیست</span>}
        </div>
      )}
    </div>
  );
};
