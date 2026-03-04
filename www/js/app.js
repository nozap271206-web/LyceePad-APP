// App.js - Gestion du thème et navigation active

function applyAndroidKioskMode() {
  if (!window.cordova) {
    return;
  }

  if (window.StatusBar && typeof window.StatusBar.hide === 'function') {
    window.StatusBar.hide();
  }

  const fullScreenPlugin = window.AndroidFullScreen || window.androidfullscreen;
  if (!fullScreenPlugin) {
    return;
  }

  const onSuccess = function() {};
  const onError = function() {};

  if (typeof fullScreenPlugin.immersiveMode === 'function') {
    fullScreenPlugin.immersiveMode(onSuccess, onError);
    return;
  }

  if (typeof fullScreenPlugin.leanMode === 'function') {
    fullScreenPlugin.leanMode(onSuccess, onError);
  }
}

document.addEventListener('deviceready', function() {
  applyAndroidKioskMode();
  setTimeout(applyAndroidKioskMode, 500);
  document.addEventListener('resume', applyAndroidKioskMode, false);
}, false);

document.addEventListener('DOMContentLoaded', function() {
  const html = document.documentElement;

  const lowMemoryDevice = navigator.deviceMemory && navigator.deviceMemory <= 4;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallScreen = window.innerWidth <= 900;

  if (lowMemoryDevice || reducedMotion || smallScreen) {
    html.classList.add('perf-lite');
  }
  
  // ===== DARK MODE =====
  const themeToggle = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;
  
  // Charger le thème sauvegardé
  const savedTheme = localStorage.getItem('dark');
  const shouldBeDark = savedTheme === 'true';
  if (htmlElement.classList.contains('dark') !== shouldBeDark) {
    htmlElement.classList.toggle('dark', shouldBeDark);
  }
  
  // Toggle dark mode
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      const isDark = htmlElement.classList.toggle('dark');
      localStorage.setItem('dark', isDark);
    });
  }

  // ===== HAMBURGER MENU =====
  const hamburgerToggle = document.getElementById('hamburger-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  if (hamburgerToggle && navLinks) {
    hamburgerToggle.addEventListener('click', function() {
      const isExpanded = hamburgerToggle.getAttribute('aria-expanded') === 'true';
      
      // Toggle l'état du menu
      hamburgerToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      
      // Mise à jour de l'accessibilité
      hamburgerToggle.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Fermer le menu quand on clique sur un lien
    const navLinksItems = navLinks.querySelectorAll('.nav-link');
    navLinksItems.forEach(link => {
      link.addEventListener('click', function() {
        hamburgerToggle.classList.remove('active');
        navLinks.classList.remove('active');
        hamburgerToggle.setAttribute('aria-expanded', 'false');
      });
    });
    
    // Fermer le menu si on clique en dehors
    document.addEventListener('click', function(event) {
      const isClickInside = hamburgerToggle.contains(event.target) || navLinks.contains(event.target);
      
      if (!isClickInside && navLinks.classList.contains('active')) {
        hamburgerToggle.classList.remove('active');
        navLinks.classList.remove('active');
        hamburgerToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ===== ACTIVE LINK =====
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '').toLowerCase() || 'home';
  const allNavLinks = document.querySelectorAll('.nav-link');
  
  allNavLinks.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage && linkPage.toLowerCase() === currentPage) {
      link.classList.add('active');
    }
  });

  // ===== SYNC STATUS BADGE =====
  updateSyncStatus();
  
  // Clic sur le badge pour forcer un ping
  const syncStatus = document.getElementById('sync-status');
  if (syncStatus) {
    syncStatus.addEventListener('click', async function() {
      if (window.DBManager && window.DBManager.pingServer) {
        syncStatus.classList.add('syncing');
        const syncText = syncStatus.querySelector('.sync-text');
        const originalText = syncText.textContent;
        syncText.textContent = 'Ping...';
        
        await window.DBManager.pingServer();
        
        // Attendre un peu pour que l'utilisateur voie le changement
        setTimeout(() => {
          updateSyncStatus();
        }, 500);
      }
    });
  }
});

// Fonction pour mettre à jour le badge de statut
function updateSyncStatus() {
  const syncStatus = document.getElementById('sync-status');
  if (!syncStatus) return;

  const syncText = syncStatus.querySelector('.sync-text');
  
  // Vérifier l'état du DBManager
  if (window.DBManager && window.DBManager.state) {
    const { isOnline, serverReachable, useFallback, lastPing } = window.DBManager.state;
    
    // Priorité : vérifier d'abord si le serveur est accessible (ping réussi)
    if (serverReachable && !useFallback) {
      // Serveur accessible et données synchronisées
      syncStatus.className = 'sync-status online';
      syncText.textContent = 'Synchro';
      
      if (lastPing && lastPing.responseTime) {
        syncStatus.title = `Serveur accessible (${lastPing.responseTime}ms)\nDonnées synchronisées`;
      } else {
        syncStatus.title = 'Serveur accessible - Données synchronisées';
      }
    } else if (isOnline && !serverReachable) {
      // Internet OK mais serveur inaccessible
      syncStatus.className = 'sync-status syncing';
      syncText.textContent = 'Local';
      syncStatus.title = `Serveur 192.168.15.38 inaccessible\nUtilisation des données locales`;
    } else if (!isOnline) {
      // Pas d'internet du tout
      syncStatus.className = 'sync-status offline';
      syncText.textContent = 'Hors ligne';
      syncStatus.title = 'Mode hors ligne - Données locales uniquement';
    } else {
      // État incertain
      syncStatus.className = 'sync-status syncing';
      syncText.textContent = 'Local';
      syncStatus.title = 'Données locales';
    }
  } else {
    // DBManager pas encore initialisé
    syncStatus.className = 'sync-status syncing';
    syncText.textContent = 'Init...';
    syncStatus.title = 'Initialisation en cours';
  }
}

// Écouter les événements de synchronisation
window.addEventListener('datasynced', function(e) {
  console.log('Données synchronisées:', e.detail);
  updateSyncStatus();
});

window.addEventListener('connectionchange', function(e) {
  console.log('Changement de connexion:', e.detail.isOnline ? 'En ligne' : 'Hors ligne');
  updateSyncStatus();
});

// Écouter les événements de ping du serveur
window.addEventListener('serverstatus', function(e) {
  const { reachable, responseTime, error } = e.detail;
  if (reachable) {
    console.log(`🟢 Serveur accessible (${responseTime}ms)`);
  } else {
    console.log(`🔴 Serveur inaccessible: ${error || 'timeout'}`);
  }
  updateSyncStatus();
});

// Mettre à jour le statut toutes les 2 secondes (le ping se fait toutes les 10s)
setInterval(updateSyncStatus, 2000);