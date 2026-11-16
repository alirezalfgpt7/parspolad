import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus.ts';
import { useAppStore } from '../../store/useAppStore.ts';
import { useT } from '../../utils/i18n.ts';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const language = useAppStore((s) => s.language);
  const t = useT(language);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 start-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
      <WifiOff className="h-4 w-4" />
      <span>{t.offlineNotice}</span>
    </div>
  );
};
