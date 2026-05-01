// ============================================================
// NOVA Store - Cart & Wishlist Module
// ============================================================

const CART_KEY      = 'nova_cart';
const WISHLIST_KEY  = 'nova_wishlist';
const ORDERS_KEY    = 'nova_orders';
const VIEWED_KEY    = 'nova_recently_viewed';

// ── Cart ──────────────────────────────────────────────────────
function getCart() {
  return JSON.parse(sessionStorage.getItem(CART_KEY) || '[]');
}
function saveCart(cart) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(product, quantity = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx > -1) {
    cart[idx].quantity = Math.min(cart[idx].quantity + quantity, product.stock || 99);
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, brand: product.brand, category: product.category, stock: product.stock || 99, quantity });
  }
  saveCart(cart);
  showToast(`<b>${product.name}</b> added to cart!`, 'success');
}

function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === productId);
  if (idx > -1) {
    if (quantity <= 0) { cart.splice(idx, 1); }
    else { cart[idx].quantity = Math.min(quantity, cart[idx].stock); }
  }
  saveCart(cart);
}

function clearCart() {
  sessionStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function getCartCount() {
  return getCart().reduce((s, i) => s + i.quantity, 0);
}

function getCartSubtotal() {
  return getCart().reduce((s, i) => s + i.price * i.quantity, 0);
}

function getShipping(subtotal) {
  return subtotal >= 100 ? 0 : 9.99;
}

function getTax(subtotal) {
  return parseFloat((subtotal * 0.08).toFixed(2));
}

function applyCoupon(code, subtotal) {
  const coupon = COUPONS[code.toUpperCase()];
  if (!coupon) return { valid: false, message: 'Invalid coupon code.' };
  if (coupon.type === 'percent') {
    return { valid: true, discount: parseFloat((subtotal * coupon.discount / 100).toFixed(2)), desc: coupon.desc };
  } else {
    if (subtotal < 200 && coupon.discount === 50) return { valid: false, message: 'Minimum order of $200 required.' };
    return { valid: true, discount: coupon.discount, desc: coupon.desc };
  }
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── Wishlist ──────────────────────────────────────────────────
function getWishlist() {
  return JSON.parse(sessionStorage.getItem(WISHLIST_KEY) || '[]');
}
function saveWishlist(list) {
  sessionStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  updateWishlistBadge();
}

function toggleWishlist(product) {
  const list = getWishlist();
  const idx = list.findIndex(i => i.id === product.id);
  if (idx > -1) {
    list.splice(idx, 1);
    showToast(`Removed from wishlist.`, 'info');
    saveWishlist(list);
    return false;
  } else {
    list.push({ id: product.id, name: product.name, price: product.price, image: product.image, brand: product.brand, category: product.category, oldPrice: product.oldPrice, rating: product.rating });
    showToast(`<b>${product.name}</b> added to wishlist!`, 'success');
    saveWishlist(list);
    return true;
  }
}

function isInWishlist(productId) {
  return getWishlist().some(i => i.id === productId);
}

function updateWishlistBadge() {
  const count = getWishlist().length;
  document.querySelectorAll('.wishlist-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── Orders ────────────────────────────────────────────────────
function getOrders() {
  const stored = sessionStorage.getItem(ORDERS_KEY);
  if (!stored) {
    sessionStorage.setItem(ORDERS_KEY, JSON.stringify(SAMPLE_ORDERS));
    return SAMPLE_ORDERS;
  }
  return JSON.parse(stored);
}

function saveOrders(orders) {
  sessionStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function placeOrder(addressData, paymentMethod, couponDiscount = 0) {
  const user = getCurrentUser();
  const cart = getCart();
  if (!cart.length) return null;
  const subtotal = getCartSubtotal();
  const shipping = getShipping(subtotal - couponDiscount);
  const tax = getTax(subtotal - couponDiscount);
  const total = parseFloat((subtotal - couponDiscount + shipping + tax).toFixed(2));
  const orderId = 'NOV-' + Date.now();
  const order = {
    id: orderId,
    userId: user ? user.id : 'guest',
    date: new Date().toISOString().split('T')[0],
    status: 'processing',
    items: cart.map(i => ({ productId: i.id, name: i.name, qty: i.quantity, price: i.price })),
    subtotal, shipping, tax, total,
    address: `${addressData.street}, ${addressData.city}, ${addressData.state} ${addressData.zip}`,
    payment: paymentMethod,
  };
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
  clearCart();
  return order;
}

function getUserOrders() {
  const user = getCurrentUser();
  if (!user) return [];
  const orders = getOrders();
  return user.role === 'admin' ? orders : orders.filter(o => o.userId === user.id);
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx > -1) { orders[idx].status = status; saveOrders(orders); }
}

// ── Recently Viewed ───────────────────────────────────────────
function addRecentlyViewed(productId) {
  let viewed = JSON.parse(sessionStorage.getItem(VIEWED_KEY) || '[]');
  viewed = [productId, ...viewed.filter(id => id !== productId)].slice(0, 8);
  sessionStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
}

function getRecentlyViewed() {
  const ids = JSON.parse(sessionStorage.getItem(VIEWED_KEY) || '[]');
  return ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
}
