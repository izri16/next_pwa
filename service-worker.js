// Note: workbox is loaded from google CDN
// Note: every "yarn build" creates a new service worker file from the browser perspective

// Listen for user confirmation for app update
addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    skipWaiting() // eslint-disable-line
  }
})

const APP_SHELL_URL = '/?app_shell=true'
const APP_SHELL_CACHE = 'app-shell'
const APP_SHELL_TMP_CACHE = 'app-shell-tmp'

const precacheController = new workbox.precaching.PrecacheController()
precacheController.addToCacheList(self.__precacheManifest)

const downloadAppShell = async () => {
  const tmpCache = await caches.open(APP_SHELL_TMP_CACHE)
  return tmpCache.add(APP_SHELL_URL)
}

self.addEventListener('install', (event) => {
  event.waitUntil(precacheController.install().then(downloadAppShell))
})

const updateAppShell = async () => {
  const tmpCache = await caches.open(APP_SHELL_TMP_CACHE)
  const cache = await caches.open(APP_SHELL_CACHE)
  const appShellReq = await tmpCache.match(APP_SHELL_URL)
  return cache.put(APP_SHELL_URL, appShellReq)
}

// FIX OFFLINE SHOWN TO USER

self.addEventListener('activate', (event) => {
  event.waitUntil(precacheController.activate().then(updateAppShell))
})

self.addEventListener('fetch', (event) => {
  const cacheKey = precacheController.getCacheKeyForURL(event.request.url)
  // Note: only handle precaching resources
  if (!cacheKey) return
  event.respondWith(caches.match(cacheKey))
})

workbox.routing.registerRoute(
  /^https/,
  new workbox.strategies.NetworkFirst({
    cacheName: 'remote-apis',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [200],
      }),
    ],
  })
)

const matchNavigationEvent = ({url, event}) => event.request.mode === 'navigate'

const handleNavigationEvent = ({url, event, params}) => {
  // If we had more "pages" (not single page app) we could add
  // conditions here about which page to serve.
  // workbox.routing.registerNavigationRoute can be used as a shortcut
  return caches.open(APP_SHELL_CACHE).then((cache) => cache.match(APP_SHELL_URL))
}

const matchEverything = ({url, event}) => true

const handleDefaultRoute = ({url, event, params}) => {
  // Everything should be cached by now
  // If not it might cause unpleasant surprises, so we want to find
  // it out as soon as possible
  throw new Error('Default route should not match!!!', url)
}

// single page route
workbox.routing.registerRoute(matchNavigationEvent, handleNavigationEvent)

// register router that matches everything and throw error in it (as nothing more should be matched)
workbox.routing.registerRoute(matchEverything, handleDefaultRoute)

// Workbox issues
// 1. workbox.routing.setCatchHandler seems not to fire at all
// 2. using workbox.expiration.Plugin each reload causes indexDB to grow by approx 1-2kb
// 3. dont see console log within its functions'/?app_shell=true'
// 4. in general hard to see what is under cover
