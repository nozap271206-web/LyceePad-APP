// About.js - JavaScript pur (sans Vue.js)

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  const isPerfLite = document.documentElement.classList.contains('perf-lite') || window.innerWidth <= 900;
  
  // Initialize AOS if available
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: isPerfLite ? 450 : 700,
      once: true,
      offset: isPerfLite ? 40 : 90,
      disable: () => document.documentElement.classList.contains('perf-lite')
    });
  }

  console.log('About.js chargé avec succès');
});