import React from 'react';
import { EffectPreloader } from '../effects/EffectPreloader.tsx';

interface PagePreloaderProps {
  label?: string;
  fullScreen?: boolean;
}

export const PagePreloader: React.FC<PagePreloaderProps> = ({
  label = 'در حال آماده‌سازی...',
  fullScreen = false,
}) => <EffectPreloader label={label} fullScreen={fullScreen} />;
