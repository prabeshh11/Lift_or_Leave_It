'use strict';

/* auth.js — Shared authentication helper for Lift or Leave It */

const AUTH = (function () {
  const TOKEN_KEY = 'loli_token';
  const USER_KEY  = 'loli_user';

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch(e) { return null; }
  }

  function getUser() {
    try { const r = localStorage.getItem(USER_KEY); return r ? JSON.parse(r) : null; } catch(e) { return null; }
  }

  function isLoggedIn() { return !!getToken(); }

  function requireLogin() {
    if (!getToken()) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.replace('/login.html?return=' + returnUrl);
    }
  }

  async function requireAdmin() {
    requireLogin();
    try {
      const res  = await authFetch('/api/users/me');
      const data = await res.json();
      if (!res.ok || data.role !== 'admin') {
        window.location.replace('/index.html?msg=access_denied');
      }
    } catch(e) {
      window.location.replace('/login.html');
    }
  }

  function authFetch(url, options) {
    options = options || {};
    const token   = getToken();
    const headers = Object.assign({}, options.headers || {});
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }
    return fetch(url, Object.assign({}, options, { headers: headers }));
  }

  function logout() {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch(e) {}
    try { sessionStorage.removeItem('lift_session'); } catch(e) {}   // kill any active game session
    window.location.replace('/index.html?toast=logged_out');
  }

  function _storeAuth(token, user) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch(e) { console.warn('[auth] localStorage unavailable:', e.message); }
  }

  return { getToken, getUser, isLoggedIn, requireLogin, requireAdmin, authFetch, logout, _storeAuth };
})();