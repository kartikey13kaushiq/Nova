// ============================================================
// NOVA Store - Authentication Module
// ============================================================

const AUTH_KEY = 'nova_current_user';

function login(email, password) {
  // Load users: start with static list, merge any admin-added users
  const allUsers = getAllUsers();
  const user = allUsers.find(u => u.email === email && u.password === password);
  if (!user) return { success: false, message: 'Invalid email or password.' };
  const session = { ...user };
  delete session.password;
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  window.location.href = 'index.html';
}

function getCurrentUser() {
  const raw = sessionStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
  return !!getCurrentUser();
}

function isAdmin() {
  const u = getCurrentUser();
  return u && u.role === 'admin';
}

function requireLogin(redirectTo = 'login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!isAdmin()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// ── User management (admin) ──────────────────────────────────
function getAllUsers() {
  const stored = sessionStorage.getItem('nova_users');
  if (stored) return JSON.parse(stored);
  const users = JSON.parse(JSON.stringify(STATIC_USERS));
  sessionStorage.setItem('nova_users', JSON.stringify(users));
  return users;
}

function saveUsers(users) {
  sessionStorage.setItem('nova_users', JSON.stringify(users));
}

function addUser(userData) {
  const users = getAllUsers();
  const id = 'u' + Date.now();
  const newUser = { id, role: 'user', joined: new Date().toISOString().split('T')[0], avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`, ...userData };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

function deleteUser(userId) {
  let users = getAllUsers();
  users = users.filter(u => u.id !== userId);
  saveUsers(users);
}

function register(name, email, password, phone = '') {
  const users = getAllUsers();
  if (users.find(u => u.email === email)) {
    return { success: false, message: 'An account with this email already exists.' };
  }
  const newUser = addUser({ name, email, password, phone, address: '' });
  const session = { ...newUser };
  delete session.password;
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return { success: true, user: session };
}

function updateProfile(data) {
  const user = getCurrentUser();
  if (!user) return false;
  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === user.id);
  if (idx === -1) return false;
  const updated = { ...users[idx], ...data };
  users[idx] = updated;
  saveUsers(users);
  const session = { ...updated };
  delete session.password;
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return true;
}
