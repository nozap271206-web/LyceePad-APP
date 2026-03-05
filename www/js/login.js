/**
 * login.js - Authentification admin
 */

// Identifiants par défaut (à changer en production !)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin' // ⚠️ À remplacer par un hash en production
};

const AUTH_TOKEN_KEY = 'lyceepad_auth_token';
const AUTH_EXPIRY_KEY = 'lyceepad_auth_expiry';

document.addEventListener('DOMContentLoaded', function() {
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

  // Soumission du formulaire
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    // Cacher le message d'erreur
    errorMessage.style.display = 'none';

    // Désactiver le bouton pendant la vérification
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Vérification...';

    // Simuler un délai (pour plus de réalisme)
    await new Promise(resolve => setTimeout(resolve, 800));

    // Vérifier les identifiants
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Authentification réussie
      console.log('✅ Authentification réussie pour:', username);
      
      const token = generateToken();
      const expiry = rememberMe ? (Date.now() + 7 * 24 * 60 * 60 * 1000) : (Date.now() + 2 * 60 * 60 * 1000);
      
      console.log('📝 Token généré:', token);
      console.log('⏰ Expiry:', expiry);
      console.log('🕐 Date actuelle:', Date.now());
      
      // Vérifier si localStorage est disponible
      try {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_EXPIRY_KEY, expiry);
        console.log('✅ Token stocké dans localStorage');
        
        // Vérifier immédiatement si on peut le relire
        const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
        console.log('🔍 Vérification: Token relu =', savedToken);
        
        if (!savedToken) {
          console.error('❌ ERREUR: localStorage ne fonctionne pas (navigation privée?)');
          showError('Erreur: Le mode navigation privée bloque la connexion. Utilisez un onglet normal.');
          btnLogin.disabled = false;
          btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Connexion';
          return;
        }
      } catch (e) {
        console.error('❌ ERREUR localStorage:', e);
        showError('Erreur: Impossible de sauvegarder la session. Désactivez le mode navigation privée.');
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Connexion';
        return;
      }

      // Feedback visuel
      btnLogin.innerHTML = '<i class="fas fa-check"></i> Connexion réussie !';
      btnLogin.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';

      // Attendre un peu avant de rediriger pour s'assurer que localStorage est bien synchronisé
      setTimeout(() => {
        // Vérifier une dernière fois avant de rediriger
        console.log('🚀 Redirection vers Admin, token:', localStorage.getItem(AUTH_TOKEN_KEY));
        window.location.href = 'Admin.html';
      }, 800);
    } else {
      // Échec de l'authentification
      showError('Identifiant ou mot de passe incorrect');
      btnLogin.disabled = false;
      btnLogin.innerHTML = '<i class="fas fa-sign-in-alt"></i> Connexion';
      
      // Secouer le formulaire
      loginForm.classList.add('shake');
      setTimeout(() => loginForm.classList.remove('shake'), 500);
    }
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
