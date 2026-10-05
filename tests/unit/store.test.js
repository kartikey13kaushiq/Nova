import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadStore } from './load.js';

const item = (price, quantity = 1, id = price) => ({ id, price, quantity });

test('escapeHtml neutralises markup and attribute breakouts', () => {
  const s = loadStore();
  assert.equal(s.escapeHtml('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(s.escapeHtml("O'Brien & Co"), 'O&#39;Brien &amp; Co');
  assert.equal(s.escapeHtml(null), '');
  assert.equal(s.escapeHtml(42), '42');
});

test('percent coupons are case-insensitive and rounded to cents', () => {
  const s = loadStore();
  assert.deepEqual({ ...s.applyCoupon(' nova10 ', 199.99) }, { valid: true, discount: 20, desc: '10% off your order' });
  assert.equal(s.applyCoupon('SAVE20', 33.33).discount, 6.67);
  assert.equal(s.applyCoupon('BOGUS', 100).valid, false);
});

test('fixed coupons enforce their minimum spend from data, not a hard-coded amount', () => {
  const s = loadStore();
  assert.match(s.applyCoupon('FLAT50', 199.99).message, /Minimum order of \$200\.00/);
  assert.equal(s.applyCoupon('FLAT50', 200).discount, 50);
  s.COUPONS.TINY = { discount: 50, type: 'fixed', desc: 'test' };
  assert.equal(s.applyCoupon('TINY', 20).discount, 20, 'a discount never exceeds the subtotal');
});

test('totals: free shipping from $100, 8% tax, both on the discounted amount', () => {
  const s = loadStore();
  assert.deepEqual({ ...s.calculateTotals([item(40, 2)]) },
    { subtotal: 80, discount: 0, shipping: 9.99, tax: 6.4, total: 96.39, coupon: null, couponError: null });
  assert.deepEqual({ ...s.calculateTotals([item(60, 2)], 'nova10') },
    { subtotal: 120, discount: 12, shipping: 0, tax: 8.64, total: 116.64, coupon: 'NOVA10', couponError: null });
  // Discount drops the order below the free-shipping threshold.
  assert.equal(s.calculateTotals([item(105)], 'SAVE20').shipping, 9.99);
  assert.equal(s.calculateTotals([]).total, 0);
});

test('an applied coupon that no longer qualifies is reported, not silently applied', () => {
  const s = loadStore();
  const t = s.calculateTotals([item(150)], 'FLAT50');
  assert.equal(t.discount, 0);
  assert.match(t.couponError, /Minimum order/);
});

test('cart respects stock and removes lines at zero quantity', () => {
  const s = loadStore();
  const p = s.getProduct(3);
  s.addToCart(p, p.stock + 10);
  assert.equal(s.getCart()[0].quantity, p.stock);
  s.updateCartQuantity(p.id, 0);
  assert.equal(s.getCart().length, 0);
});

test('placing an order charges the applied coupon and resets the cart', () => {
  const s = loadStore();
  assert.equal(s.login('user1@test.com', 'user123').success, true);
  s.addToCart(s.getProduct(1), 1); // $2,499
  s.setAppliedCoupon('flat50');
  const order = s.placeOrder({ street: '1 Main St', city: 'Austin', state: 'TX', zip: '73301' }, 'card');
  assert.equal(order.discount, 50);
  assert.equal(order.coupon, 'FLAT50');
  assert.equal(order.total, parseFloat((2449 + 2449 * 0.08).toFixed(2)));
  assert.equal(order.userId, 'u1');
  assert.equal(s.getCart().length, 0);
  assert.equal(s.getAppliedCoupon(), '');
  assert.equal(s.getUserOrders()[0].id, order.id);
  assert.ok(s.getUserOrders().every(o => o.userId === 'u1'), 'members only see their own orders');
});

test('auth: login, duplicate registration, sessions never hold the password', () => {
  const s = loadStore();
  assert.equal(s.login('user1@test.com', 'wrong').success, false);
  const admin = s.login('admin@test.com', 'admin123');
  assert.equal(admin.success, true);
  assert.equal(s.isAdmin(), true);
  assert.equal('password' in s.getCurrentUser(), false);
  assert.equal(s.register('X', 'admin@test.com', 'pw').success, false);
  const r = s.register('New Person', 'new@test.com', 'Secret#1');
  assert.equal(r.success, true);
  assert.equal(s.isAdmin(), false);
  assert.equal(s.updateProfile({ phone: '555' }), true);
  assert.equal(s.getCurrentUser().phone, '555');
});

test('search, related products and recently viewed', () => {
  const s = loadStore();
  assert.ok(s.searchProducts('apple').length >= 3);
  const p = s.getProduct('1');
  const related = s.getRelatedProducts(p);
  assert.ok(related.length > 0 && related.every(r => r.category === p.category && r.id !== p.id));
  for (const id of [1, 2, 3, 1]) s.addRecentlyViewed(id);
  assert.deepEqual([...s.getRecentlyViewed().map(x => x.id)], [1, 3, 2]);
});

test('wishlist toggles', () => {
  const s = loadStore();
  const p = s.getProduct(2);
  assert.equal(s.toggleWishlist(p), true);
  assert.equal(s.isInWishlist(2), true);
  assert.equal(s.toggleWishlist(p), false);
  assert.equal(s.isInWishlist(2), false);
});

test('catalogue data is internally consistent', () => {
  const s = loadStore();
  const ids = new Set();
  for (const p of s.PRODUCTS) {
    assert.ok(!ids.has(p.id), `duplicate product id ${p.id}`);
    ids.add(p.id);
    assert.ok(s.CATEGORIES.some(c => c.id === p.category), `${p.name}: unknown category ${p.category}`);
    assert.ok(p.price > 0 && (!p.oldPrice || p.oldPrice >= p.price), `${p.name}: bad pricing`);
    assert.ok(p.stock >= 0 && p.rating >= 0 && p.rating <= 5, `${p.name}: bad stock/rating`);
  }
  for (const c of s.CATEGORIES) {
    assert.equal(c.count, s.PRODUCTS.filter(p => p.category === c.id).length, `category ${c.id} count is stale`);
  }
});
