// map.js - Initialisation de la carte Leaflet avec DBManager

// Fonction pour naviguer vers une zone
function goToZone(qrCode) {
  window.location.href = `ZoneContent.html?qr=${qrCode}`;
}

// Initialiser la carte au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
  
  try {
    // Attendre que DBManager soit initialisé
    if (!window.DBManager || !window.DBManager.state.db) {
      console.log('Attente initialisation DBManager...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Récupérer toutes les zones actives
    const zones = await window.DBManager.getActiveZones();
    console.log(`${zones.length} zones chargées depuis DBManager`);

    // ===== INITIALISATION DE LA CARTE LEAFLET =====
    const map = L.map('map').setView([43.52130, 5.44360], 19);

    // Coordonnées GPS pour les coins de l'image (Nord-Ouest à Sud-Est)
    const imageBounds = [
      [43.52175, 5.44265],  // Nord-Ouest (en haut à gauche)
      [43.52085, 5.44455]   // Sud-Est (en bas à droite)
    ];

    // Ajouter l'image du plan du lycée
    L.imageOverlay('../img/plan-lycee.png', imageBounds, {
      opacity: 1,
      interactive: false
    }).addTo(map);

    // Ajouter OpenStreetMap en arrière-plan très transparent
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      opacity: 0.1,
      maxZoom: 19
    }).addTo(map);

    // Ajouter les markers (QR codes) pour chaque zone
    zones.forEach(zone => {
      // Vérifier que la zone a des coordonnées
      if (!zone.coordonnees || !zone.coordonnees.lat || !zone.coordonnees.lng) {
        console.warn(`Zone ${zone.nom} n'a pas de coordonnées GPS`);
        return;
      }

      // Créer un marker personnalisé moderne avec icône QR
      const qrIcon = L.divIcon({
        html: `
          <div class="qr-marker">
            <div class="marker-pulse"></div>
            <div class="marker-content">
              <svg class="qr-icon" width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM19 19h2v2h-2z"/>
              </svg>
            </div>
          </div>
        `,
        className: 'qr-marker-container',
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -50]
      });

      const marker = L.marker([zone.coordonnees.lat, zone.coordonnees.lng], { icon: qrIcon }).addTo(map);

      // Popup avec infos et bouton moderne
      const popupContent = `
        <div class="popup-content">
          <div class="popup-badge">${zone.batiment || 'Zone'}</div>
          <h3 class="popup-title">${zone.nom}</h3>
          <p class="popup-description">${zone.description}</p>
          <button onclick="goToZone('${zone.qr_code}')" class="popup-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 16 16 12 12 8"></polyline>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            <span>Découvrir</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        className: 'custom-popup'
      });
    });

    // Fit bounds
    map.fitBounds(imageBounds, { padding: [10, 10] });

    // ===== GÉNÉRATION DYNAMIQUE DES CARTES DE ZONES =====
    const zonesGrid = document.getElementById('zones-grid');
    zonesGrid.innerHTML = ''; // Vider d'abord
    
    zones.forEach(zone => {
      const zoneCard = document.createElement('div');
      zoneCard.className = 'zone-card';
      zoneCard.onclick = () => goToZone(zone.qr_code);
      
      // Icône basée sur le bâtiment
      let icon = '📍';
      if (zone.batiment.includes('Sud')) icon = '📘';
      else if (zone.batiment.includes('Nord')) icon = '🔬';
      else if (zone.batiment.includes('FB')) icon = '💻';
      else if (zone.batiment.includes('Est')) icon = '🏢';
      else if (zone.batiment.includes('C')) icon = '🏛️';
      else if (zone.nom.includes('Internat')) icon = '🛏️';
      else if (zone.nom.includes('Amphithéatre')) icon = '🎭';

      zoneCard.innerHTML = `
        <div class="zone-number">${zone.ordre || zone.id}</div>
        <div class="zone-icon">${icon}</div>
        <h3 class="zone-name">${zone.nom}</h3>
        <p class="zone-description">${zone.batiment} ${zone.etage ? '- ' + zone.etage : ''}</p>
        <button class="zone-btn">
          Découvrir
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      `;
      
      zonesGrid.appendChild(zoneCard);
    });

  } catch (error) {
    console.error('Erreur chargement de la carte:', error);
    alert('Erreur lors du chargement des zones. Veuillez actualiser la page.');
  }
});