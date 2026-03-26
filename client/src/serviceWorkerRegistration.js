const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
      if (isLocalhost) {
        checkValidServiceWorker(swUrl);
      } else {
        registerValidSW(swUrl);
      }
    });
  }
}

function registerValidSW(swUrl) {
  navigator.serviceWorker.register(swUrl).then((registration) => {
    registration.onupdatefound = () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.onstatechange = () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('New version available. Refresh to update.');
        }
      };
    };
  }).catch(console.error);
}

function checkValidServiceWorker(swUrl) {
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((res) => {
      if (res.status === 404) {
        navigator.serviceWorker.ready.then((r) => r.unregister());
      } else {
        registerValidSW(swUrl);
      }
    })
    .catch(() => console.log('App running offline.'));
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((r) => r.unregister());
  }
}
