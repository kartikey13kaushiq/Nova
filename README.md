# NOVA Store

[![CI](https://github.com/kartikey13kaushiq/nova/actions/workflows/ci.yml/badge.svg)](https://github.com/kartikey13kaushiq/nova/actions/workflows/ci.yml)
[![Deploy](https://github.com/kartikey13kaushiq/nova/actions/workflows/pages.yml/badge.svg)](https://github.com/kartikey13kaushiq/nova/actions/workflows/pages.yml)
![No build step](https://img.shields.io/badge/build-none-brightgreen) ![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey)

A complete e-commerce storefront in plain HTML, CSS and JavaScript: catalogue, search, cart,
coupons, multi-step checkout, order history, wishlist, and an admin area for products, users
and orders. There is no framework, no build step and no backend. It runs from any static host,
and the GitHub Pages deployment is automated.

**Live demo:** https://kartikey13kaushiq.github.io/nova/

| Role | Email | Password |
|---|---|---|
| Admin | `admin@test.com` | `admin123` |
| Member | `user1@test.com` | `user123` |

Coupons: `NOVA10`, `SAVE20`, `WELCOME`, `DEAL30` (percent off), and `FLAT50` ($50 off orders of $200 or more).

## Features

- **Shopping:** 40 products in 7 categories; filter by category, price, rating and brand; sort; grid and list views; pagination; live search; quick view; related and recently viewed products; wishlist.
- **Cart and checkout:** quantity limits based on stock; coupon validation with minimum spend; free shipping from $100; 8% tax on the discounted amount; Address → Payment → Confirm flow; printable invoice.
- **Accounts:** registration with a password-strength meter, login, profile editing, order history and tracking, 30-minute idle timeout.
- **Admin:** dashboard with Chart.js revenue and category charts; product CRUD; user management; order status updates.
- **UI:** dark and light themes, responsive layout, hero carousel, deal countdown, scroll animations, toasts, FAQ search, help chat widget.

## How it is built

```
index.html, products.html, ... (20 pages)
css/style.css      design system with dark/light theme tokens
js/data.js         catalogue, categories, coupons, demo users and orders
js/auth.js         login, registration, profile, roles
js/cart.js         cart, coupons, pricing (calculateTotals), orders, wishlist
js/app.js          navbar, footer, search, chat widget, helpers (escapeHtml, formatPrice)
```

The scripts are classic `<script>` files that share one global scope, loaded in the order
`data → auth → cart → app`. Every price shown or stored goes through one pure function,
`calculateTotals(items, couponCode)`. That makes the cart page, checkout and the saved order
agree by construction.

State is held in `sessionStorage`, so each browser tab is an isolated demo session.

> **This is a front-end demo, not a secure shop.** Login, roles and the admin guard run in the
> browser and can be bypassed by anyone with dev tools. Passwords for the demo accounts are in
> the source. A real deployment needs a server that authenticates users, authorises every
> request and recomputes prices. Nothing on this site handles real payments.

Third-party libraries load from CDNs at pinned versions with
[Subresource Integrity](https://developer.mozilla.org/docs/Web/Security/Subresource_Integrity)
hashes. All user-entered text (names, addresses, chat messages) is escaped before it reaches
the DOM.

## Run locally

```bash
npm start            # python3 -m http.server 8080 -> http://localhost:8080
```

Any static server works. Opening the files directly from disk also works, except for features
that need an origin, such as the clipboard.

## Quality checks

```bash
npm ci
npm run lint         # ESLint
npm test             # unit tests (node:test) against the real js/ files, loaded in a VM sandbox
npx playwright install chromium
npm run test:e2e     # Playwright end-to-end tests, desktop + mobile Chromium
```

- **Unit tests** cover pricing, coupons, the cart's stock limits, order placement, auth,
  search, the wishlist, and a consistency check of the catalogue data.
- **End-to-end tests** run in a real browser: every page loads without script errors, a coupon
  applied in the cart is charged at checkout, login and role guards work, and an XSS payload
  typed into the chat or a profile name is rendered as text.
- The e2e suite is hermetic. Pinned CDN libraries are served from `node_modules` (byte-identical,
  so the SRI hashes still verify), and images, fonts and other third-party requests are stubbed.

CI runs all of this on every push and pull request. Pushes to `main` then deploy to GitHub Pages.

## Deploying

1. In the repository go to **Settings → Pages → Source** and select **GitHub Actions** (one-time setup).
2. Push to `main`. The `Deploy to GitHub Pages` workflow publishes only the pages, `css/` and `js/`.

## License

[MIT](LICENSE)
