// Loads the site's browser scripts into an isolated VM context with in-memory storage,
// so their real code (not a copy) can be unit tested under Node.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

class MemoryStorage {
  #data = new Map();
  getItem(k) { return this.#data.has(k) ? this.#data.get(k) : null; }
  setItem(k, v) { this.#data.set(k, String(v)); }
  removeItem(k) { this.#data.delete(k); }
  clear() { this.#data.clear(); }
}

const FILES = ['js/data.js', 'js/auth.js', 'js/cart.js', 'js/app.js'];

export function loadStore() {
  const toasts = [];
  const context = {
    console,
    sessionStorage: new MemoryStorage(),
    localStorage: new MemoryStorage(),
    location: { href: '', search: '' },
    document: {
      addEventListener() {},
      querySelectorAll: () => [],
      getElementById: () => null,
      documentElement: { setAttribute() {} },
    },
    setTimeout, clearTimeout,
    toasts,
  };
  context.window = context;
  vm.createContext(context);
  // Top-level const/function declarations in a script are visible to later scripts in the same context.
  const source = FILES.map(f => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8')).join('\n;\n');
  vm.runInContext(`${source}
    showToast = (message, type) => toasts.push({ message, type });
    globalThis.api = { escapeHtml, formatPrice, applyCoupon, calculateTotals, getCartTotals, addToCart, getCart,
      updateCartQuantity, clearCart, setAppliedCoupon, getAppliedCoupon, placeOrder, getUserOrders, login, logout,
      register, getCurrentUser, isAdmin, updateProfile, searchProducts, getProduct, getRelatedProducts,
      toggleWishlist, isInWishlist, addRecentlyViewed, getRecentlyViewed, PRODUCTS, COUPONS, CATEGORIES };`,
    context, { filename: 'nova-bundle.js' });
  return context.api;
}
