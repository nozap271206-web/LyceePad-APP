
// Diagnostic : vérifier que le bon script est chargé
console.log('login.js chargé - version debug 2026-03-12');

/**
 * login.js - Authentification admin
 */


const AUTH_TOKEN_KEY = 'lyceepad_auth_token';
const AUTH_EXPIRY_KEY = 'lyceepad_auth_expiry';

document.addEventListener('DOMContentLoaded', function() {
    // Simulation automatique pour diagnostic (à retirer en production)
    // Remplit le formulaire et tente une connexion automatique après 1s
    setTimeout(() => {
      if (usernameInput && passwordInput && btnLogin) {
        usernameInput.value = 'admin';
        passwordInput.value = 'admin';
        btnLogin.click();
        console.log('Simulation : tentative de connexion automatique avec admin/admin');
      }
    }, 1000);
  const loginForm = document.getElementById('loginForm');
  
  // Vérifier si on est sur la page de login (les éléments n'existent que là)
  if (!loginForm) {
    console.log('login.js chargé mais pas sur la page de login');
    return; // Sortir si on n'est pas sur la page login
  }
  
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberMeCheckbox = document.getElementById('rememberMe');
  const togglePasswordBtn = document.getElementById('togglePassword');
  const btnLogin = document.getElementById('btnLogin');
  const errorMessage = document.getElementById('errorMessage');

  // Toggle visibility du mot de passe
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', function() {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      
      const icon = togglePasswordBtn.querySelector('i');
      icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    });
  }

  // Soumission du formulaire (identifiants en dur, version forcée)
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    errorMessage.style.display = 'none';
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vérification...';

    // Identifiants en dur
    const VALID_USERNAME = 'admin';
    const VALID_PASSWORD = 'admin';

    setTimeout(() => {
      if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        // Authentification réussie
        const token = generateToken();
        const expiry = rememberMe ? (Date.now() + 7 * 24 * 60 * 60 * 1000) : (Date.now() + 2 * 60 * 60 * 1000);
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_EXPIRY_KEY, expiry);
        btnLogin.innerHTML = '<i class="fas fa-check"></i> Connexion réussie !';
        btnLogin.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
        setTimeout(() => {
          window.location.href = 'Admin.html';
        }, 800);
      } else {
        showError('Identifiant ou mot de passe incorrect');
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Connexion';
        loginForm.classList.add('shake');
        setTimeout(() => loginForm.classList.remove('shake'), 500);
      }
    }, 500);
  });

  // Afficher un message d'erreur
  function showError(message) {
    const errorText = document.getElementById('errorText');
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
  }

  // Générer un token simple (à améliorer en production)
  function generateToken() {
    return 'lyceepad_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  // Focus automatique sur le champ username
  if (usernameInput) {
    usernameInput.focus();
  }
});

/**
 * Fonction utilitaire : Vérifier si l'utilisateur est authentifié
 */
function isAuthenticated() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);

  if (!token || !expiry) {
    return false;
  }

  // Vérifier l'expiration
  if (Date.now() > parseInt(expiry)) {
    // Token expiré
    logout();
    return false;
  }

  return true;
}

/**
 * Fonction utilitaire : Déconnexion
 */
function logout() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
  window.location.href = 'login.html';
}

/**
 * Fonction utilitaire : Rediriger vers login si non authentifié
 */
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Exporter pour utilisation globale
window.AuthManager = {
  isAuthenticated,
  logout,
  requireAuth
};
