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

  // ===== ACTIVE LINK =====
  const currentPage = window.location.pathname.split('/').pop().replace('.html', '').toLowerCase() || 'home';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage && linkPage.toLowerCase() === currentPage) {
      link.classList.add('active');
    }
  });
});