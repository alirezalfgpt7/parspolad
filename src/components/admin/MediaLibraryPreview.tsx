import React, { useEffect, useRef, useState } from 'react';
import { Film } from 'lucide-react';
import { mediaUrl } from '../../services/api.ts';
import type { MediaFile } from '../../types/index.ts';
import { isVideoMediaUrl } from '../../utils/brandingDefaults.ts';
import { MediaThumbnail } from './MediaThumbnail.tsx';
import { ZeroBrokenImage } from '../ui/ZeroBrokenImage.tsx';

interface MediaLibraryPreviewProps {
  item: MediaFile;
}

export const MediaLibraryPreview: React.FC<MediaLibraryPreviewProps> = ({ item }) => {
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const video = item.mime_type.startsWith('video/') || isVideoMediaUrl(item.url);
  const gif = item.mime_type === 'image/gif' || item.extension.toLowerCase() === 'gif';
  const originalUrl = mediaUrl(item.preview_url || item.url);
  const videoUrl = mediaUrl(item.optimized_preview_url || item.preview_url || item.url);
  const thumbnailUrl = item.thumbnail_url ? mediaUrl(item.thumbnail_url) : undefined;
  const imageUrl = gif ? originalUrl : thumbnailUrl || originalUrl;

  useEffect(() => {
    setVideoFailed(false);
  }, [item.id, item.preview_url, item.url]);

  if (video && !videoFailed) {
    return (
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        muted
        loop
        playsInline
        preload="none"
        onError={() => setVideoFailed(true)}
        className="h-full w-full object-contain"
      />
    );
  }

  if (video && !thumbnailUrl) {
    return (
      <div className="flex flex-col items-center gap-1 text-(--theme-text-muted)" aria-label="پیش‌نمایش ویدئو موجود نیست">
        <Film className="h-7 w-7" aria-hidden="true" />
        <span className="text-[10px]">پیش‌نمایش موجود نیست</span>
      </div>
    );
  }

  if (!video && !gif) {
    return (
      <MediaThumbnail
        mediaId={item.id}
        alt={item.alt_text || item.name}
        isVideo={false}
        originalUrl={originalUrl}
        thumbnailUrl={item.thumbnail_url}
      />
    );
  }

  return (
    <ZeroBrokenImage
      src={video ? thumbnailUrl : imageUrl}
      alt={item.alt_text || item.name}
      className="h-full w-full object-contain"
      loading="eager"
    />
  );
};
