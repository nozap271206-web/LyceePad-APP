/**
 * login.js - Authentification admin via BDD
 */

const AUTH_TOKEN_KEY  = 'lyceepad_auth_token';
const AUTH_EXPIRY_KEY = 'lyceepad_auth_expiry';
const AUTH_USER_KEY   = 'lyceepad_auth_user';

document.addEventListener('DOMContentLoaded', function () {
  const loginForm    = document.getElementById('loginForm');
  if (!loginForm) return;

  const emailInput       = document.getElementById('username');
  const passwordInput    = document.getElementById('password');
  const rememberMe       = document.getElementById('rememberMe');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const btnLogin         = document.getElementById('btnLogin');
  const errorMessage     = document.getElementById('errorMessage');
  const errorText        = document.getElementById('errorText');

  // Toggle visibilité mot de passe
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function () {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      togglePasswordBtn.querySelector('i').className =
        type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  }

  // Soumission du formulaire
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email    = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Veuillez remplir tous les champs');
      return;
    }

    errorMessage.style.display = 'none';
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vérification...';

    try {
      // URL absolue vers le serveur (fonctionne en Cordova et navigateur)
      const serverBase = (location.protocol === 'https:' ? location.origin : 'https://lycee-pad.cc');
      const apiUrl     = serverBase + '/API/auth.php';

      const response = await fetch(apiUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Utiliser le token généré côté serveur
        const token  = data.token;
        const expiry = rememberMe.checked
          ? Date.now() + 7 * 24 * 60 * 60 * 1000   // 7 jours
          : Date.now() + 2 * 60 * 60 * 1000;        // 2 heures

        localStorage.setItem(AUTH_TOKEN_KEY,  token);
        localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
        localStorage.setItem(AUTH_USER_KEY,   JSON.stringify(data.user));

        btnLogin.innerHTML = '<i class="fas fa-check"></i> Connexion réussie !';
        btnLogin.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

        setTimeout(() => {
          window.location.href = 'Admin.html';
        }, 700);

      } else {
        showError(data.message || 'Identifiants invalides');
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Connexion';
      }

    } catch (err) {
      // Réseau indisponible → fallback local admin/admin pour les tests
      console.warn('API injoignable, fallback local :', err.message);
      const email_ = emailInput.value.trim();
      const pwd_   = passwordInput.value;

      if (email_ === 'admin@lycee-steloi.fr' && pwd_ === 'admin') {
        const token  = 'lyceepad_local_' + Date.now().toString(36);
        const expiry = Date.now() + 2 * 60 * 60 * 1000;
        localStorage.setItem(AUTH_TOKEN_KEY,  token);
        localStorage.setItem(AUTH_EXPIRY_KEY, expiry.toString());
        localStorage.setItem(AUTH_USER_KEY,   JSON.stringify({ nom: 'Admin', role: 'admin' }));
        window.location.href = 'Admin.html';
      } else {
        showError('Serveur inaccessible et identifiants inconnus hors-ligne');
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Connexion';
      }
    }
  });

  function showError(msg) {
    errorText.textContent    = msg;
    errorMessage.style.display = 'flex';
  }

  if (emailInput) emailInput.focus();
});

// ── Utilitaires d'authentification ──────────────────────────────────────────

function isAuthenticated() {
  const token  = localStorage.getItem(AUTH_TOKEN_KEY);
  const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
  if (!token || !expiry) return false;
  if (Date.now() > parseInt(expiry)) { logout(); return false; }
  return true;
}

function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  const isInHtmlDir = window.location.pathname.includes('/html/');
  window.location.href = isInHtmlDir ? 'login.html' : 'html/login.html';
}

function requireAuth() {
  if (!isAuthenticated()) {
    const isInHtmlDir = window.location.pathname.includes('/html/');
    window.location.replace(isInHtmlDir ? 'login.html' : 'html/login.html');
    return false;
  }
  return true;
}

window.AuthManager = { isAuthenticated, logout, requireAuth };
