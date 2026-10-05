# Changelog

## 1.1.0

### Fixed
- A coupon applied in the cart was dropped at checkout, so orders were charged full price. The
  applied coupon is now kept for the session and is part of the saved order and invoice.
- Adding a product to the cart for the first time could exceed its stock.
- `FLAT50`'s $200 minimum was hard-coded against the discount amount. Minimum spend is now a
  coupon property, and no discount can exceed the subtotal.
- Stored and reflected XSS: user names, emails, phone numbers, addresses and chat messages were
  inserted as HTML in the navbar, toasts, chat, orders, invoices and admin tables.
- Deleting a user whose name contained a quote broke the admin table's inline handler.

### Added
- `calculateTotals()`, the single pricing function shared by the cart, checkout and orders.
- Subresource Integrity on CDN assets, and a pinned Chart.js version.
- ESLint, `node:test` unit tests, Playwright end-to-end tests (desktop and mobile), GitHub Actions
  CI, and automated GitHub Pages deployment.
