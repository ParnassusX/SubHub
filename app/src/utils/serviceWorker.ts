// Service Worker registration and management utilities

// Extend ServiceWorkerRegistration interface for background sync
declare global {
  interface ServiceWorkerRegistration {
    sync?: {
      register(tag: string): Promise<void>;
    };
  }
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
}

export function register(config?: ServiceWorkerConfig) {
  if ('serviceWorker' in navigator) {
    // Only register in production or if explicitly enabled in development
    if (process.env.NODE_ENV === 'production' || process.env.VITE_SW_DEV === 'true') {
      const publicUrl = new URL('/', window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        return;
      }

      window.addEventListener('load', () => {
        const swUrl = '/sw.js';

        if (isLocalhost) {
          checkValidServiceWorker(swUrl, config);
          navigator.serviceWorker.ready.then(() => {
            console.log(
              'This web app is being served cache-first by a service worker.'
            );
          });
        } else {
          registerValidSW(swUrl, config);
        }
      });
    }
  }
}

function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              console.log(
                'New content is available and will be used when all tabs for this page are closed.'
              );

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              console.log('Content is cached for offline use.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }

              if (config && config.onOfflineReady) {
                config.onOfflineReady();
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Utility to check if app is running offline
export function isOffline(): boolean {
  return !navigator.onLine;
}

// Utility to add offline action for later sync
export function addOfflineAction(action: {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  timestamp: number;
}) {
  try {
    const existingActions = JSON.parse(localStorage.getItem('subhub_offline_actions') || '[]');
    existingActions.push(action);
    localStorage.setItem('subhub_offline_actions', JSON.stringify(existingActions));
    
    // Register for background sync if available
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync?.register('background-sync');
      }).catch(error => {
        console.log('Background sync not supported:', error);
      });
    }
  } catch (error) {
    console.error('Failed to add offline action:', error);
  }
}

// Utility to show update available notification
export function showUpdateAvailable(registration: ServiceWorkerRegistration) {
  // Create a simple notification
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1a2332;
      border: 1px solid #2e4e6b;
      border-radius: 8px;
      padding: 16px;
      color: white;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    ">
      <div style="margin-bottom: 12px;">
        <strong>Update Available</strong>
      </div>
      <div style="margin-bottom: 12px; color: #9ca3af;">
        A new version of SubHub is available. Refresh to update.
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="sw-update-btn" style="
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Update</button>
        <button id="sw-dismiss-btn" style="
          background: #6b7280;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">Later</button>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Handle update button click
  const updateBtn = notification.querySelector('#sw-update-btn');
  const dismissBtn = notification.querySelector('#sw-dismiss-btn');

  updateBtn?.addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  });

  dismissBtn?.addEventListener('click', () => {
    document.body.removeChild(notification);
  });

  // Auto-dismiss after 10 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 10000);
}

// Listen for service worker messages
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATE_AVAILABLE') {
      // Handle update available message
      console.log('Service Worker update available');
    }
  });
}

// Network status monitoring
export function setupNetworkMonitoring() {
  const updateOnlineStatus = () => {
    const status = navigator.onLine ? 'online' : 'offline';
    document.body.setAttribute('data-network-status', status);
    
    if (status === 'online') {
      // Trigger background sync when coming back online
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          return registration.sync?.register('background-sync');
        }).catch(error => {
          console.log('Background sync not supported:', error);
        });
      }
    }
  };

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Set initial status
  updateOnlineStatus();
}

// Initialize service worker with default configuration
export function initializeServiceWorker() {
  register({
    onSuccess: () => {
      console.log('Service Worker registered successfully');
    },
    onUpdate: (registration) => {
      console.log('Service Worker update available');
      showUpdateAvailable(registration);
    },
    onOfflineReady: () => {
      console.log('App is ready for offline use');
    },
  });

  setupNetworkMonitoring();
}
