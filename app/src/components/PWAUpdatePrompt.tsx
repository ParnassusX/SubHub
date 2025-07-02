// PWA Update Prompt Component
import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from '../hooks/useTranslation';

const PWAUpdatePrompt: React.FC = () => {
  const { t } = useTranslation();
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);

  const {
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error: any) {
      console.log('SW registration error', error);
    },
    onOfflineReady() {
      setOfflineReady(true);
    },
    onNeedRefresh() {
      setNeedRefresh(true);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  // Auto-hide offline ready message after 5 seconds
  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(() => {
        setOfflineReady(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [offlineReady]);

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Update Available */}
      {needRefresh && (
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg border border-blue-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">
                {t('updateAvailable')}
              </h4>
              <p className="text-xs text-blue-100 mb-3">
                {t('updateAvailableDescription')}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => updateServiceWorker(true)}
                  className="px-3 py-1 bg-white text-blue-600 text-xs font-medium rounded hover:bg-blue-50 transition-colors"
                >
                  {t('reload')}
                </button>
                <button
                  onClick={close}
                  className="px-3 py-1 bg-blue-700 text-white text-xs font-medium rounded hover:bg-blue-800 transition-colors"
                >
                  {t('later')}
                </button>
              </div>
            </div>
            <button
              onClick={close}
              className="ml-2 text-blue-200 hover:text-white transition-colors"
              aria-label={t('close')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Offline Ready */}
      {offlineReady && (
        <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg border border-green-500">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">
                {t('offlineReady')}
              </h4>
              <p className="text-xs text-green-100">
                {t('offlineReadyDescription')}
              </p>
            </div>
            <button
              onClick={close}
              className="ml-2 text-green-200 hover:text-white transition-colors"
              aria-label={t('close')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAUpdatePrompt;
