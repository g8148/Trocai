import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import {
  CacheFirst,
  CacheableResponsePlugin,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from "serwist"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const privatePagePrefixes = [
  "/account",
  "/chat",
  "/items/",
  "/loans",
  "/notifications",
  "/reports",
  "/reviews",
]

const runtimeCaching = [
  {
    matcher: ({ request, url }: { request: Request; url: URL }) =>
      request.headers.has("authorization") || url.pathname.startsWith("/api/"),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ request, url }: { request: Request; url: URL }) =>
      request.mode === "navigate" &&
      privatePagePrefixes.some((prefix) => url.pathname.startsWith(prefix)),
    handler: new NetworkOnly(),
  },
  {
    matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/_next/static/"),
    handler: new CacheFirst({
      cacheName: "trocai-static-v1",
      plugins: [
        new ExpirationPlugin({ maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      ],
    }),
  },
  {
    matcher: ({ url }: { url: URL }) => url.pathname.startsWith("/media/"),
    handler: new StaleWhileRevalidate({
      cacheName: "trocai-media-v1",
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 7 }),
      ],
    }),
  },
  {
    matcher: ({ request }: { request: Request }) => request.mode === "navigate",
    handler: new NetworkFirst({
      cacheName: "trocai-pages-v1",
      networkTimeoutSeconds: 4,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 }),
      ],
    }),
  },
]

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  disableDevLogs: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document"
        },
      },
    ],
  },
})

serwist.addEventListeners()
