# NOVA Store — GitHub Pages Deployment Guide

## Quick Deploy (5 minutes)

### Step 1 — Create GitHub Repository
1. Go to [github.com](https://github.com) → **New repository**
2. Name it: `nova-store` (or any name you like)
3. Set to **Public**
4. Click **Create repository**

### Step 2 — Upload Files
**Option A — GitHub Web UI (easiest):**
1. Click **"uploading an existing file"** on the new repo page
2. Drag and drop the entire project folder contents
3. Click **Commit changes**

**Option B — Git CLI:**
```bash
cd clg_project
git init
git add .
git commit -m "Initial commit: NOVA Store"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nova-store.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Select branch: **main**, folder: **/ (root)**
4. Click **Save**
5. Wait ~60 seconds, then visit: `https://YOUR_USERNAME.github.io/nova-store/`

---

## File Structure

```
nova-store/
├── index.html          ← Homepage
├── products.html       ← Products listing (search, filter, sort)
├── product.html        ← Product detail page
├── cart.html           ← Shopping cart + coupon codes
├── checkout.html       ← Checkout + payment + invoice
├── wishlist.html       ← Saved items
├── login.html          ← Login (with demo credentials)
├── register.html       ← Registration + password strength
├── profile.html        ← User profile + recent orders
├── orders.html         ← Order history + tracking + invoice
├── categories.html     ← All categories with products
├── offers.html         ← Deals + coupon codes + countdown
├── about.html          ← About page + team
├── contact.html        ← Contact form
├── faq.html            ← FAQ with search + accordion
├── 404.html            ← Custom 404 with glitch animation
├── admin.html          ← Admin dashboard + charts
├── admin-products.html ← Product CRUD (add/edit/delete)
├── admin-users.html    ← User management
├── admin-orders.html   ← Order management + status updates
├── css/
│   └── style.css       ← Complete design system (dark/light)
└── js/
    ├── data.js         ← 40+ products, users, coupons, hero slides
    ├── auth.js         ← Login, register, session management
    ├── cart.js         ← Cart, wishlist, orders, recently viewed
    └── app.js          ← Navbar, footer, utilities, chatbot
```

---

## Demo Credentials

| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@test.com    | admin123  |
| User  | user1@test.com    | user123   |
| User  | user2@test.com    | user123   |

---

## Coupon Codes

| Code    | Discount              |
|---------|-----------------------|
| NOVA10  | 10% off               |
| SAVE20  | 20% off               |
| FLAT50  | $50 off (min $200)    |
| WELCOME | 15% off (new members) |
| DEAL30  | 30% off               |

---

## Features Checklist

### UI/UX
- [x] Dark / Light mode toggle
- [x] Fully responsive (mobile, tablet, desktop)
- [x] Premium glassmorphism navbar with blur
- [x] Hero carousel with 3 slides
- [x] Animated countdown timer (deals)
- [x] Scroll reveal animations
- [x] Skeleton loaders
- [x] Toast notifications
- [x] Back to top button
- [x] Live search with dropdown
- [x] Quick View modal
- [x] Glitch 404 animation
- [x] Floating chatbot widget

### Shopping
- [x] 40 products across 7 categories
- [x] Filter by category, price, rating, brand
- [x] Sort by price, rating, name, reviews
- [x] Grid / List view toggle
- [x] Pagination
- [x] Add to cart, remove, update quantity
- [x] Coupon codes with validation
- [x] Wishlist (add/remove/move to cart)
- [x] Recently viewed products
- [x] Related products
- [x] Star ratings + reviews

### Checkout & Orders
- [x] Multi-step checkout (Address → Payment → Confirm)
- [x] Card / PayPal / COD payment UI
- [x] Order confirmation with fake order ID
- [x] Printable HTML invoice
- [x] Order tracking (Processing → Shipped → Delivered)
- [x] Reorder from history
- [x] Cancel orders

### Auth
- [x] Login with session storage
- [x] Register with password strength meter
- [x] Role-based access (admin vs user)
- [x] Session timeout (30 min)
- [x] Profile editing
- [x] Password toggle (show/hide)

### Admin
- [x] Dashboard with Chart.js revenue + category charts
- [x] Full Product CRUD (add, edit, delete, search, filter, sort)
- [x] User management (view, add, delete)
- [x] Order management (view, update status, invoice, cancel)

---

## Tech Stack
- HTML5 + CSS3 + Vanilla JavaScript
- Bootstrap 5.3 (CDN)
- Font Awesome 6.5 (CDN)
- Chart.js (admin dashboard)
- DiceBear Avatars (user avatars)
- Unsplash (product images)
- No backend, no database, no build step required
