import { test, expect } from './fixtures.js';

async function login(page, email, password) {
  await page.goto('/login.html');
  await page.fill('#loginEmail', email);
  await page.fill('#loginPassword', password);
  await page.click('#loginBtn');
}

async function loginAs(page, email, password, landing) {
  await login(page, email, password);
  await page.waitForURL(landing); // the form signs in, then redirects after a short delay
}

test('home page renders the navigation, featured products and footer', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page).toHaveTitle(/NOVA/);
  await expect(page.locator('#navbar-container nav')).toBeVisible();
  await expect(page.locator('.product-card').first()).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});

test('every page loads without script errors', async ({ page }) => {
  for (const path of ['index', 'products', 'product', 'categories', 'offers', 'about', 'contact', 'faq',
    'cart', 'checkout', 'wishlist', 'login', 'register', '404']) {
    const res = await page.goto(`/${path}.html${path === 'product' ? '?id=3' : ''}`);
    expect(res.status(), path).toBe(200);
    await expect(page.locator('body')).toBeVisible();
  }
});

test('a coupon applied in the cart is charged at checkout', async ({ page }) => {
  await page.goto('/product.html?id=1'); // MacBook Pro, $2,499
  await page.getByRole('button', { name: /Add to Cart/ }).first().click();
  await expect(page.locator('.cart-badge').first()).toHaveText('1');

  await page.goto('/cart.html');
  await page.fill('#couponInput', 'flat50');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.locator('#summDiscount')).toHaveText('-$50.00');
  const expected = (2449 + 2449 * 0.08).toFixed(2);
  await expect(page.locator('#summTotal')).toHaveText(`$${expected}`);

  await page.goto('/checkout.html');
  await expect(page.locator('#coDiscount')).toHaveText('-$50.00');
  await expect(page.locator('#coTotal')).toHaveText(`$${expected}`);
  for (const [id, value] of Object.entries({ firstName: 'Ada', lastName: 'Lovelace', emailField: 'ada@example.com',
    streetField: '1 Analytical Way', cityField: 'London', stateField: 'LDN', zipField: 'N1 9GU' })) {
    await page.fill(`#${id}`, value);
  }
  await page.getByRole('button', { name: /Continue to Payment/ }).click();
  await page.locator('#pay-cod').click();
  await page.getByRole('button', { name: /Place Order/ }).click();
  await expect(page.locator('#orderSuccess')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#orderIdDisplay')).toHaveText(/^NOV-\d+$/);
  await expect(page.locator('.cart-badge').first()).toBeHidden();
});

test('minimum-spend coupons are rejected below the threshold', async ({ page }) => {
  await page.goto('/product.html?id=3'); // $349
  await page.getByRole('button', { name: /Add to Cart/ }).first().click();
  await page.goto('/cart.html');
  await page.fill('#couponInput', 'NOPE');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.locator('#couponMsg')).toContainText('Invalid coupon code');
  await expect(page.locator('#discountRow')).toBeHidden();
});

test('members can log in and see only their orders; the admin area is guarded', async ({ page }) => {
  await page.goto('/admin.html');
  await expect(page).toHaveURL(/index\.html$/);

  await loginAs(page, 'user1@test.com', 'user123', /profile\.html$/);
  await page.goto('/orders.html');
  await expect(page.getByText('NOV-2024-001').first()).toBeVisible();
  await expect(page.getByText('DEC-2024-003')).toHaveCount(0); // another member's order

  await page.goto('/admin.html');
  await expect(page).toHaveURL(/index\.html$/);
});

test('admins reach the dashboard', async ({ page }) => {
  await loginAs(page, 'admin@test.com', 'admin123', /admin\.html$/);
  await page.goto('/admin.html');
  await expect(page).toHaveURL(/admin\.html$/);
  await expect(page.getByText('DEC-2024-003').first()).toBeVisible();
});

test('wrong credentials are refused', async ({ page }) => {
  await login(page, 'user1@test.com', 'not-the-password');
  await expect(page).toHaveURL(/login\.html/);
  await expect(page.getByText(/Invalid email or password/)).toBeVisible();
});

test('script typed into the chat or a profile name is shown as text, never executed', async ({ page }) => {
  let dialogs = 0;
  page.on('dialog', d => { dialogs++; d.dismiss(); });
  await page.goto('/index.html');
  await page.locator('#chat-bubble').click();
  const payload = '<img src=x onerror="alert(1)">';
  await page.fill('#chat-input', payload);
  await page.press('#chat-input', 'Enter');
  await expect(page.locator('.chat-msg.user').last()).toHaveText(payload);

  await page.goto('/register.html');
  await page.fill('#regName', payload);
  await page.fill('#regEmail', 'xss@example.com');
  await page.fill('#regPassword', 'Secret#123');
  await page.fill('#regConfirm', 'Secret#123');
  await page.check('#agreeTerms');
  await page.locator('#regBtn').click();
  await page.waitForURL(url => !url.pathname.endsWith('register.html'));
  await page.goto('/index.html');
  await expect(page.locator('#navbar-container')).toContainText(payload);
  await expect(page.locator('img[src="x"]')).toHaveCount(0);
  expect(dialogs).toBe(0);
});
