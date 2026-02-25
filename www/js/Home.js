// Home.js - JavaScript pur (sans Vue.js)

// Données des stats
const stats = [
  { value: '7', label: 'Zones interactives', icon: '📍' },
  { value: '50+', label: 'Contenus multimédias', icon: '🎬' },
  { value: '100%', label: 'Gratuit', icon: '✨' }
];

// Fonction pour générer le style des particules
function getParticleStyle(i) {
  return {
    '--x': `${Math.random() * 100}%`,
    '--y': `${Math.random() * 100}%`,
    '--duration': `${15 + Math.random() * 20}s`,
    '--delay': `${Math.random() * 5}s`,
    '--size': `${2 + Math.random() * 4}px`
  };
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  const isPerfLite = document.documentElement.classList.contains('perf-lite') || window.innerWidth <= 900;

  const particles = document.querySelectorAll('.particle');
  const maxParticles = isPerfLite ? 10 : 18;
  particles.forEach((particle, index) => {
    if (index >= maxParticles) {
      particle.remove();
    }
  });
  
  // Initialize AOS (Animate On Scroll) if available
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: isPerfLite ? 450 : 700,
      once: true,
      offset: isPerfLite ? 40 : 90,
      disable: () => document.documentElement.classList.contains('perf-lite')
    });
  }

  // Protection contre les clics accidentels sur le bouton CTA
  const ctaBtn = document.querySelector('.cta-btn-mega');
  if (ctaBtn) {
    let clickEnabled = false;
    
    // Activer le bouton après un court délai pour éviter les clics accidentels au chargement
    setTimeout(() => {
      clickEnabled = true;
    }, 500);
    
    // Empêcher les clics multiples rapides
    let isNavigating = false;
    ctaBtn.addEventListener('click', function(e) {
      if (!clickEnabled || isNavigating) {
        e.preventDefault();
        return false;
      }
      isNavigating = true;
    });
  }

  console.log('Home.js chargé avec succès');
});