import React from 'react';
import { EffectPreloader } from '../effects/EffectPreloader.tsx';
import type { PreloaderModeSettings } from '../../types/index.ts';

interface PagePreloaderProps {
  label?: string;
  fullScreen?: boolean;
  modeSettings?: PreloaderModeSettings;
}

export const PagePreloader: React.FC<PagePreloaderProps> = ({
  label = 'در حال آماده‌سازی...',
  fullScreen = false,
  modeSettings,
}) => <EffectPreloader label={label} fullScreen={fullScreen} modeSettings={modeSettings} />;
