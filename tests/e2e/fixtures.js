import { test as base, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const local = (pkg, file) => readFileSync(new URL(`../../node_modules/${pkg}/${file}`, import.meta.url));

// Pinned CDN libraries are served from node_modules (same files, same SRI hashes) and other
// third-party assets (icons, fonts, product photos, avatars) are stubbed, so the suite is
// hermetic: no flakiness from the network and no traffic to third parties from CI.
const LIBS = {
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css': ['text/css', () => local('bootstrap', 'dist/css/bootstrap.min.css')],
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js': ['application/javascript', () => local('bootstrap', 'dist/js/bootstrap.bundle.min.js')],
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js': ['application/javascript', () => local('chart.js', 'dist/chart.umd.js')],
};
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64');

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err));
    await page.route(url => !['127.0.0.1', 'localhost'].includes(url.hostname), route => {
      const url = route.request().url();
      if (LIBS[url]) {
        const [contentType, body] = LIBS[url];
        return route.fulfill({ contentType, body: body(), headers: { 'access-control-allow-origin': '*' } });
      }
      if (route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/png', body: PIXEL });
      if (route.request().resourceType() === 'stylesheet') return route.fulfill({ contentType: 'text/css', body: '' });
      return route.fulfill({ status: 204, body: '' });
    });
    await use(page);
    expect(errors, 'uncaught errors in the page').toEqual([]);
  },
});
export { expect };
