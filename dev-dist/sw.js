/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-b4e67f7e'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "3ca0b8505b4bec776b69afdba2768812"
  }, {
    "url": "index.html",
    "revision": "0.bfad4m1b1rg"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html"), {
    allowlist: [/^\/$/]
  }));
  workbox.registerRoute(({
    url
  }) => url.origin === self.location.origin && /^\/(?:storage|images)\//.test(url.pathname) && /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname), new workbox.CacheFirst({
    "cacheName": "public-media-immutable-images-v1",
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [200]
    }), new workbox.ExpirationPlugin({
      maxEntries: 60,
      maxAgeSeconds: 2592000,
      purgeOnQuotaError: true
    })]
  }), 'GET');
  workbox.registerRoute(({
    url
  }) => url.origin === self.location.origin && /^\/(?:storage|images)\//.test(url.pathname) && /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname), new workbox.NetworkFirst({
    "cacheName": "public-media-images-v1",
    "networkTimeoutSeconds": 3,
    "fetchOptions": {
      "cache": "no-cache"
    },
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [200]
    }), new workbox.ExpirationPlugin({
      maxEntries: 40,
      maxAgeSeconds: 2592000,
      purgeOnQuotaError: true
    })]
  }), 'GET');
  workbox.registerRoute(({
    url
  }) => url.origin === self.location.origin && /^\/(?:storage|images)\//.test(url.pathname) && /\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:mp4|webm|ogv|ogg)$/i.test(url.pathname), new workbox.CacheFirst({
    "cacheName": "public-media-immutable-videos-v1",
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [200]
    }), new workbox.ExpirationPlugin({
      maxEntries: 2,
      maxAgeSeconds: 604800,
      purgeOnQuotaError: true
    }), new workbox.RangeRequestsPlugin()]
  }), 'GET');
  workbox.registerRoute(({
    url
  }) => url.origin === self.location.origin && /^\/(?:storage|images)\//.test(url.pathname) && /\.(?:mp4|webm|ogv|ogg)$/i.test(url.pathname), new workbox.NetworkFirst({
    "cacheName": "public-media-videos-v1",
    "networkTimeoutSeconds": 3,
    "fetchOptions": {
      "cache": "no-cache"
    },
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [200]
    }), new workbox.ExpirationPlugin({
      maxEntries: 2,
      maxAgeSeconds: 604800,
      purgeOnQuotaError: true
    }), new workbox.RangeRequestsPlugin()]
  }), 'GET');

}));
