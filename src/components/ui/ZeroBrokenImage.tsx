import React, { useState } from 'react';
import { Factory } from 'lucide-react';
import { cn } from '../../utils/i18n.ts';

interface ZeroBrokenImageProps {
  src?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export const ZeroBrokenImage: React.FC<ZeroBrokenImageProps> = ({
  src,
  alt,
  className,
  loading = 'lazy',
}) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div
        className={cn(
          'zero-broken-image-fallback bg-linear-to-br from-slate-100 to-slate-200 text-slate-500 dark:from-slate-800 dark:to-slate-900 dark:text-slate-400',
          className
        )}
      >
        <Factory className="h-8 w-8 opacity-50" />
        {alt && <span>{alt}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className={className}
    />
  );
};
