// ============================================================
// NOVA Store - Core App (Navbar, Footer, Utilities)
// ============================================================

// ── Utility ───────────────────────────────────────────────────
function formatPrice(n) { return CURRENCY + parseFloat(n).toFixed(2); }
function formatDate(d) { return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
function generateId() { return Math.random().toString(36).substring(2, 9).toUpperCase(); }
function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) html += '<i class="fas fa-star text-warning"></i>';
    else if (i - rating < 1) html += '<i class="fas fa-star-half-alt text-warning"></i>';
    else html += '<i class="far fa-star text-warning"></i>';
  }
  return html;
}
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
function slugify(s) { return s.toLowerCase().replace(/\s+/g, '-'); }

// ── Toast ─────────────────────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const icons = { success: 'fa-check-circle', danger: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
  const colors = { success: '#22c55e', danger: '#ef4444', warning: '#f59e0b', info: '#06b6d4' };
  const container = document.getElementById('toast-container');
  if (!container) return;
  const id = 'toast-' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'nova-toast show';
  div.innerHTML = `
    <div class="toast-icon" style="color:${colors[type]}"><i class="fas ${icons[type]}"></i></div>
    <div class="toast-msg">${message}</div>
    <button onclick="document.getElementById('${id}').remove()" class="toast-close"><i class="fas fa-times"></i></button>`;
  container.appendChild(div);
  setTimeout(() => { div.classList.remove('show'); setTimeout(() => div.remove(), 400); }, duration);
}

// ── Theme ─────────────────────────────────────────────────────
function getTheme() { return localStorage.getItem('nova_theme') || 'dark'; }
function setTheme(t) {
  localStorage.setItem('nova_theme', t);
  document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('.theme-icon').forEach(el => {
    el.className = 'fas ' + (t === 'dark' ? 'fa-sun' : 'fa-moon') + ' theme-icon';
  });
}
function toggleTheme() { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); }

// ── Product Helpers ───────────────────────────────────────────
function getProductsByCategory(cat) { return PRODUCTS.filter(p => p.category === cat); }
function getFeaturedProducts()      { return PRODUCTS.filter(p => p.featured); }
function searchProducts(query) {
  const q = query.toLowerCase();
  return PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.tags.some(t => t.includes(q)) || p.category.includes(q));
}
function getProduct(id) { return PRODUCTS.find(p => p.id === parseInt(id)); }
function getRelatedProducts(product, limit = 4) {
  return PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, limit);
}
function getAllProducts() { return [...PRODUCTS]; }

// ── Product Card HTML ─────────────────────────────────────────
function renderProductCard(p, extra = '') {
  const inWishlist = isInWishlist(p.id);
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return `
  <div class="col" data-aos>
    <div class="product-card" onclick="window.location='product.html?id=${p.id}'">
      <div class="product-img-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/400x400/1a1a2e/7c3aed?text=NOVA'">
        ${p.badge ? `<span class="product-badge badge-${slugify(p.badge)}">${p.badge}</span>` : ''}
        ${discount > 0 ? `<span class="product-discount">-${discount}%</span>` : ''}
        <div class="product-overlay">
          <button class="btn-overlay" title="Quick View" onclick="event.stopPropagation();quickView(${p.id})"><i class="fas fa-eye"></i></button>
          <button class="btn-overlay wishlist-btn-${p.id}" title="Wishlist" onclick="event.stopPropagation();handleWishlist(${p.id})">
            <i class="${inWishlist ? 'fas' : 'far'} fa-heart" style="color:${inWishlist ? '#ef4444' : ''}"></i>
          </button>
        </div>
      </div>
      <div class="product-body">
        <div class="product-brand">${p.brand}</div>
        <h6 class="product-name">${p.name}</h6>
        <div class="product-stars">${renderStars(p.rating)} <span class="review-count">(${p.reviews.toLocaleString()})</span></div>
        <div class="product-price-row">
          <span class="product-price">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="product-old-price">${formatPrice(p.oldPrice)}</span>` : ''}
        </div>
        <button class="btn btn-add-cart w-100" onclick="event.stopPropagation();addToCart(getProduct(${p.id}))">
          <i class="fas fa-cart-plus me-2"></i>Add to Cart
        </button>
      </div>
    </div>
  </div>`;
}

function handleWishlist(productId) {
  const p = getProduct(productId);
  if (!p) return;
  const added = toggleWishlist(p);
  document.querySelectorAll(`.wishlist-btn-${productId} i`).forEach(el => {
    el.className = added ? 'fas fa-heart' : 'far fa-heart';
    el.style.color = added ? '#ef4444' : '';
  });
  updateWishlistBadge();
}

// ── Quick View Modal ──────────────────────────────────────────
function quickView(productId) {
  const p = getProduct(productId);
  if (!p) return;
  const discount = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  document.getElementById('quickViewBody').innerHTML = `
    <div class="row g-4">
      <div class="col-md-5">
        <img src="${p.image}" alt="${p.name}" class="img-fluid rounded-3 w-100" style="object-fit:cover;height:300px">
      </div>
      <div class="col-md-7">
        <span class="badge mb-2" style="background:var(--primary)">${p.category}</span>
        <h4 class="fw-bold mb-1">${p.name}</h4>
        <div class="mb-2">${renderStars(p.rating)} <span class="text-muted small">(${p.reviews} reviews)</span></div>
        <div class="d-flex align-items-center gap-3 mb-3">
          <span class="fs-4 fw-bold" style="color:var(--primary)">${formatPrice(p.price)}</span>
          ${p.oldPrice ? `<span class="text-muted text-decoration-line-through">${formatPrice(p.oldPrice)}</span>` : ''}
          ${discount > 0 ? `<span class="badge bg-danger">${discount}% OFF</span>` : ''}
        </div>
        <p class="text-muted small mb-3">${p.description.substring(0, 150)}...</p>
        <div class="mb-3"><span class="badge ${p.stock > 5 ? 'bg-success' : 'bg-warning'}">${p.stock > 5 ? 'In Stock' : 'Low Stock (' + p.stock + ' left)'}</span></div>
        <div class="d-flex gap-2">
          <button class="btn btn-primary flex-fill" onclick="addToCart(getProduct(${p.id}));bootstrap.Modal.getInstance(document.getElementById('quickViewModal')).hide()">
            <i class="fas fa-cart-plus me-2"></i>Add to Cart
          </button>
          <button class="btn btn-outline-danger" onclick="handleWishlist(${p.id})">
            <i class="fas fa-heart"></i>
          </button>
          <a href="product.html?id=${p.id}" class="btn btn-outline-secondary"><i class="fas fa-external-link-alt"></i></a>
        </div>
      </div>
    </div>`;
  new bootstrap.Modal(document.getElementById('quickViewModal')).show();
}

// ── Navbar HTML ───────────────────────────────────────────────
function renderNavbar() {
  const user = getCurrentUser();
  const cartCount = getCartCount();
  const wishCount = getWishlist().length;
  const html = `
  <nav class="navbar navbar-expand-lg fixed-top" id="mainNav">
    <div class="container-xxl">
      <a class="navbar-brand" href="index.html">
        <span class="brand-icon"><i class="fas fa-bolt"></i></span>
        <span class="brand-text">NOVA</span><span class="brand-sub">Store</span>
      </a>
      <div class="nav-search d-none d-lg-flex">
        <div class="search-wrap">
          <i class="fas fa-search search-icon"></i>
          <input type="text" id="navSearch" class="search-input" placeholder="Search products, brands...">
          <div id="searchDropdown" class="search-dropdown"></div>
        </div>
      </div>
      <div class="d-flex align-items-center gap-2 ms-auto">
        <button class="btn btn-icon d-none d-sm-flex" onclick="toggleTheme()" title="Toggle theme">
          <i class="fas fa-sun theme-icon"></i>
        </button>
        <a href="wishlist.html" class="btn btn-icon position-relative" title="Wishlist">
          <i class="far fa-heart"></i>
          <span class="badge-bubble wishlist-badge" style="display:${wishCount > 0 ? 'flex' : 'none'}">${wishCount}</span>
        </a>
        <a href="cart.html" class="btn btn-icon position-relative" title="Cart">
          <i class="fas fa-shopping-bag"></i>
          <span class="badge-bubble cart-badge" style="display:${cartCount > 0 ? 'flex' : 'none'}">${cartCount}</span>
        </a>
        ${user ? `
        <div class="dropdown">
          <button class="btn btn-icon d-flex align-items-center gap-2" data-bs-toggle="dropdown">
            <img src="${user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id}" class="rounded-circle" width="28" height="28" style="object-fit:cover">
          </button>
          <ul class="dropdown-menu dropdown-menu-end nova-dropdown">
            <li class="dropdown-header"><b>${user.name}</b><br><small class="text-muted">${user.email}</small></li>
            <li><hr class="dropdown-divider"></li>
            ${user.role === 'admin' ? '<li><a class="dropdown-item" href="admin.html"><i class="fas fa-tachometer-alt me-2"></i>Admin Dashboard</a></li>' : ''}
            <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>My Profile</a></li>
            <li><a class="dropdown-item" href="orders.html"><i class="fas fa-box me-2"></i>My Orders</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><button class="dropdown-item text-danger" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</button></li>
          </ul>
        </div>` : `
        <a href="login.html" class="btn btn-sm btn-primary px-3">
          <i class="fas fa-user me-1"></i>Login
        </a>`}
        <button class="navbar-toggler border-0 btn btn-icon" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      <div class="collapse navbar-collapse" id="navMenu">
        <ul class="navbar-nav ms-auto mt-3 mt-lg-0 me-3 gap-1">
          <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="categories.html" data-bs-toggle="dropdown">Categories</a>
            <ul class="dropdown-menu nova-dropdown mega-dropdown">
              ${CATEGORIES.map(c => `<li><a class="dropdown-item" href="products.html?category=${c.id}"><i class="fas ${c.icon} me-2" style="color:${c.color}"></i>${c.name}</a></li>`).join('')}
            </ul>
          </li>
          <li class="nav-item"><a class="nav-link" href="products.html">Products</a></li>
          <li class="nav-item"><a class="nav-link" href="offers.html"><span class="badge bg-danger me-1">Hot</span>Deals</a></li>
          <li class="nav-item"><a class="nav-link" href="about.html">About</a></li>
          <li class="nav-item"><a class="nav-link" href="contact.html">Contact</a></li>
        </ul>
        <div class="d-flex d-lg-none mt-2 mb-3">
          <div class="search-wrap w-100">
            <i class="fas fa-search search-icon"></i>
            <input type="text" id="mobileSearch" class="search-input" placeholder="Search...">
          </div>
        </div>
      </div>
    </div>
  </nav>
  <!-- Quick View Modal -->
  <div class="modal fade" id="quickViewModal" tabindex="-1">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content nova-modal">
        <div class="modal-header border-0">
          <h5 class="modal-title">Quick View</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" id="quickViewBody"></div>
      </div>
    </div>
  </div>`;
  document.getElementById('navbar-container').innerHTML = html;
  initSearch();
  setTheme(getTheme());
}

// ── Search ────────────────────────────────────────────────────
function initSearch() {
  const inputs = ['navSearch', 'mobileSearch'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', debounce(function() {
      const q = this.value.trim();
      const dd = document.getElementById('searchDropdown');
      if (!dd) return;
      if (q.length < 2) { dd.classList.remove('show'); return; }
      const results = searchProducts(q).slice(0, 6);
      if (!results.length) { dd.innerHTML = '<div class="sd-empty">No results found</div>'; dd.classList.add('show'); return; }
      dd.innerHTML = results.map(p => `
        <a href="product.html?id=${p.id}" class="sd-item">
          <img src="${p.image}" onerror="this.src='https://placehold.co/48x48/1a1a2e/7c3aed?text=N'">
          <div><div class="sd-name">${p.name}</div><div class="sd-price">${formatPrice(p.price)}</div></div>
        </a>`).join('') + `<a href="products.html?search=${encodeURIComponent(q)}" class="sd-all">View all results <i class="fas fa-arrow-right ms-1"></i></a>`;
      dd.classList.add('show');
    }, 250));
    document.addEventListener('click', e => {
      if (!el.contains(e.target)) {
        const dd = document.getElementById('searchDropdown');
        if (dd) dd.classList.remove('show');
      }
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' && el.value.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(el.value.trim())}`;
      }
    });
  });
}

// ── Footer HTML ───────────────────────────────────────────────
function renderFooter() {
  const footerEl = document.getElementById('footer-container');
  if (!footerEl) return;
  footerEl.innerHTML = `
  <footer class="site-footer">
    <div class="footer-top">
      <div class="container-xxl">
        <div class="row g-4">
          <div class="col-lg-4">
            <div class="footer-brand mb-3">
              <span class="brand-icon"><i class="fas fa-bolt"></i></span>
              <span class="brand-text">NOVA</span><span class="brand-sub">Store</span>
            </div>
            <p class="footer-desc">Premium shopping destination for electronics, fashion, beauty & more. Shop the future today.</p>
            <div class="footer-socials mt-3">
              <a href="#" class="social-btn"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-btn"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-btn"><i class="fab fa-facebook"></i></a>
              <a href="#" class="social-btn"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
          <div class="col-6 col-lg-2">
            <h6 class="footer-heading">Shop</h6>
            <ul class="footer-links">
              ${CATEGORIES.map(c => `<li><a href="products.html?category=${c.id}">${c.name}</a></li>`).join('')}
            </ul>
          </div>
          <div class="col-6 col-lg-2">
            <h6 class="footer-heading">Account</h6>
            <ul class="footer-links">
              <li><a href="profile.html">My Profile</a></li>
              <li><a href="orders.html">My Orders</a></li>
              <li><a href="wishlist.html">Wishlist</a></li>
              <li><a href="cart.html">Cart</a></li>
              <li><a href="login.html">Login</a></li>
            </ul>
          </div>
          <div class="col-6 col-lg-2">
            <h6 class="footer-heading">Help</h6>
            <ul class="footer-links">
              <li><a href="faq.html">FAQ</a></li>
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="about.html">About Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Returns</a></li>
            </ul>
          </div>
          <div class="col-6 col-lg-2">
            <h6 class="footer-heading">Newsletter</h6>
            <p class="small text-muted mb-2">Get deals & new arrivals</p>
            <div class="input-group mb-2">
              <input type="email" class="form-control form-control-sm" placeholder="Your email" id="footerEmail">
              <button class="btn btn-primary btn-sm" onclick="subscribeNewsletter()">Go</button>
            </div>
            <div class="footer-badges mt-3">
              <i class="fab fa-cc-visa fs-4 me-2 text-muted"></i>
              <i class="fab fa-cc-mastercard fs-4 me-2 text-muted"></i>
              <i class="fab fa-cc-paypal fs-4 me-2 text-muted"></i>
              <i class="fab fa-cc-amex fs-4 text-muted"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container-xxl d-flex flex-wrap justify-content-between align-items-center gap-2">
        <p class="mb-0 small text-muted">© ${new Date().getFullYear()} NOVA Store. All rights reserved.</p>
        <div class="d-flex gap-3">
          <a href="#" class="small text-muted">Privacy</a>
          <a href="#" class="small text-muted">Terms</a>
          <a href="#" class="small text-muted">Cookies</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function subscribeNewsletter() {
  const email = document.getElementById('footerEmail')?.value.trim();
  if (!email || !email.includes('@')) { showToast('Please enter a valid email address.', 'warning'); return; }
  showToast('Thanks for subscribing! 🎉 Check your inbox.', 'success');
  document.getElementById('footerEmail').value = '';
}

// ── Back to Top ───────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Navbar Scroll Effect ──────────────────────────────────────
function initNavbarScroll() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── Active nav link ───────────────────────────────────────────
function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('#mainNav .nav-link').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (page === href || (page === '' && href === 'index.html'))) a.classList.add('active');
  });
}

// ── AOS-lite (simple scroll reveal) ──────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-aos]').forEach(el => { el.classList.add('reveal-me'); obs.observe(el); });
}

// ── Chatbot Widget ────────────────────────────────────────────
function initChatbot() {
  const widget = document.createElement('div');
  widget.id = 'chatbot-widget';
  widget.innerHTML = `
    <div id="chat-bubble" onclick="toggleChat()" title="Chat with NOVA Bot">
      <i class="fas fa-comments"></i>
      <span class="chat-dot"></span>
    </div>
    <div id="chat-window" class="d-none">
      <div class="chat-header">
        <div class="d-flex align-items-center gap-2">
          <div class="chat-avatar"><i class="fas fa-robot"></i></div>
          <div><div class="fw-semibold">NOVA Assistant</div><small class="text-success">● Online</small></div>
        </div>
        <button onclick="toggleChat()" class="btn btn-sm btn-icon"><i class="fas fa-times"></i></button>
      </div>
      <div id="chat-messages" class="chat-messages">
        <div class="chat-msg bot">👋 Hi! I'm NOVA Bot. How can I help you today?</div>
        <div class="chat-suggestions">
          <button onclick="chatReply('Track my order')">Track Order</button>
          <button onclick="chatReply('Return policy')">Returns</button>
          <button onclick="chatReply('Shipping info')">Shipping</button>
          <button onclick="chatReply('Best deals')">Deals</button>
        </div>
      </div>
      <div class="chat-input-row">
        <input id="chat-input" type="text" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendChat()">
        <button onclick="sendChat()"><i class="fas fa-paper-plane"></i></button>
      </div>
    </div>`;
  document.body.appendChild(widget);
}
function toggleChat() {
  const w = document.getElementById('chat-window');
  w.classList.toggle('d-none');
}
const chatResponses = {
  'track': 'You can track your order under <a href="orders.html">My Orders</a>. Check your order ID in the confirmation email.',
  'return': 'We offer 30-day hassle-free returns. Visit our <a href="contact.html">Contact page</a> to initiate a return.',
  'shipping': 'Free shipping on orders over $100! Standard delivery is 3-5 business days. Express 1-2 days available.',
  'deal': 'Check out our <a href="offers.html">Offers page</a> for the hottest deals and use code <b>NOVA10</b> for 10% off!',
  'help': 'I can help with orders, returns, shipping, and deals. What do you need?',
  'hello': '👋 Hi there! Great to meet you. How can I assist you today?',
  'default': "I'm not sure about that, but our team can help! Visit our <a href='contact.html'>Contact page</a> or email us at support@novastore.com"
};
function chatReply(msg) {
  appendChat(msg, 'user');
  const key = Object.keys(chatResponses).find(k => msg.toLowerCase().includes(k));
  setTimeout(() => appendChat(chatResponses[key] || chatResponses.default, 'bot'), 600);
}
function sendChat() {
  const inp = document.getElementById('chat-input');
  if (!inp.value.trim()) return;
  chatReply(inp.value.trim());
  inp.value = '';
}
function appendChat(msg, role) {
  const m = document.getElementById('chat-messages');
  const d = document.createElement('div');
  d.className = `chat-msg ${role}`;
  d.innerHTML = msg;
  m.appendChild(d);
  m.scrollTop = m.scrollHeight;
}

// ── Order Status Badge ────────────────────────────────────────
function statusBadge(status) {
  const map = { processing: 'warning', shipped: 'info', delivered: 'success', cancelled: 'danger' };
  return `<span class="badge bg-${map[status] || 'secondary'}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
}

// ── Init Page ─────────────────────────────────────────────────
function initPage() {
  renderNavbar();
  renderFooter();
  initBackToTop();
  initNavbarScroll();
  setActiveNavLink();
  setTimeout(initScrollReveal, 100);
  initChatbot();
  // Session timeout (30 min inactivity)
  let timeout;
  const resetTimer = () => {
    clearTimeout(timeout);
    if (isLoggedIn()) {
      timeout = setTimeout(() => {
        showToast('Session expired. Please login again.', 'warning');
        setTimeout(() => logout(), 2000);
      }, 30 * 60 * 1000);
    }
  };
  ['mousemove', 'keypress', 'click', 'scroll'].forEach(e => document.addEventListener(e, resetTimer));
  resetTimer();
}

document.addEventListener('DOMContentLoaded', initPage);
