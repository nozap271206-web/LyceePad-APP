// map.js — Plan du lycée avec overlay CSS (pas de Leaflet)

// Puces sur le plan — positions en % (left, top) par rapport à l'image 867x519
const mapPins = [
  {
    label: 'Salles Sud',
    description: 'BTS CIEL IR',
    qr: 'QR_SUD_07',
    x: 16,
    y: 36
  },
  {
    label: 'Salles FB',
    description: 'Bâtiment FB — Salles de cours',
    qr: 'QR_FB_10',
    x: 32,
    y: 48
  },
  {
    label: 'CDI / Bât. C',
    description: 'Centre de documentation et administration',
    qr: 'QR_CDI_001',
    x: 53,
    y: 42
  },
  {
    label: 'Amphithéâtre',
    description: 'Salle polyvalente et spectacles',
    qr: 'QR_AMPHITHÉATRE_001',
    x: 60,
    y: 27
  },
  {
    label: 'Salles Nord',
    description: 'Bâtiment Nord — BTS MS',
    qr: 'QR_NORD_08',
    x: 82,
    y: 32
  },
  {
    label: 'Salles Est',
    description: 'Bâtiment Est — BAC Pro',
    qr: 'QR_EST_11',
    x: 85,
    y: 57
  },
  {
    label: 'Internat',
    description: 'Hébergement des élèves',
    qr: 'QR_INTERNAT_001',
    x: 37,
    y: 68
  }
];

function goToZone(qrCode) {
  window.location.href = `ZoneContent.html?qr=${qrCode}`;
}

async function loadZonesLocally() {
  const response = await fetch('../data/qr-data.json');
  if (!response.ok) throw new Error('Fichier qr-data.json introuvable');
  const data = await response.json();
  return Object.values(data.zones).filter(z => z.actif);
}

// Afficher/cacher le popup d'une puce
function togglePopup(container, pin, markerEl) {
  // Fermer un popup ouvert
  const existing = container.querySelector('.map-popup.visible');
  if (existing) {
    const wasThisOne = existing.dataset.qr === pin.qr;
    existing.remove();
    container.querySelectorAll('.qr-marker-container').forEach(m => m.classList.remove('active'));
    if (wasThisOne) return;
  }

  const popup = document.createElement('div');
  popup.className = 'map-popup visible';
  popup.dataset.qr = pin.qr;
  popup.innerHTML = `
    <h3 class="popup-title">${pin.label}</h3>
    <p class="popup-description">${pin.description}</p>
    <button class="popup-btn" onclick="goToZone('${pin.qr}')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
      Découvrir
    </button>
  `;

  popup.style.left = pin.x + '%';
  popup.style.top  = pin.y + '%';
  container.appendChild(popup);
  markerEl.classList.add('active');

  // Ajuster position pour éviter les débordements
  requestAnimationFrame(() => {
    const cw  = container.offsetWidth;
    const ch  = container.offsetHeight;
    const pw  = popup.offsetWidth;
    const ph  = popup.offsetHeight;
    const px  = (pin.x / 100) * cw;
    const py  = (pin.y / 100) * ch;

    // Débordement haut → popup en dessous du marker
    const flipY = py - ph - 14 < 0;
    const translateY = flipY ? 'calc(22px)' : 'calc(-100% - 14px)';

    // Débordement droite ou gauche
    let translateX = '-50%';
    if (px + pw / 2 > cw - 8)  translateX = '-90%';
    else if (px - pw / 2 < 8)  translateX = '-10%';

    popup.style.transform = `translate(${translateX}, ${translateY})`;
  });
}

// Construire le plan avec overlay CSS
function buildPlanMap() {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;

  // Vider et préparer le conteneur
  mapDiv.innerHTML = '';
  mapDiv.classList.add('plan-overlay-container');

  // Image du plan
  const img = document.createElement('img');
  img.src = '../img/plan-lycee.png';
  img.alt = 'Plan du Lycée Saint-Éloi';
  img.className = 'plan-image';
  mapDiv.appendChild(img);

  // Fermer popup en cliquant sur le fond
  mapDiv.addEventListener('click', () => {
    const open = mapDiv.querySelector('.map-popup');
    if (open) {
      open.remove();
      mapDiv.querySelectorAll('.qr-marker-container').forEach(m => m.classList.remove('active'));
    }
  });

  // Ajouter les puces
  mapPins.forEach(pin => {
    const marker = document.createElement('div');
    marker.className = 'qr-marker-container';
    marker.style.left = pin.x + '%';
    marker.style.top  = pin.y + '%';
    marker.innerHTML = `
      <div class="qr-marker">
        <div class="marker-pulse"></div>
        <div class="marker-content">
          <svg class="qr-icon" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2zM15 15h2v2h-2zM13 17h2v2h-2zM15 19h2v2h-2zM17 17h2v2h-2zM17 13h2v2h-2zM19 15h2v2h-2zM19 19h2v2h-2z"/>
          </svg>
        </div>
      </div>
    `;

    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePopup(mapDiv, pin, marker);
    });

    mapDiv.appendChild(marker);
  });
}

document.addEventListener('DOMContentLoaded', async function () {
  buildPlanMap();

  // Charger les zones pour la grille du bas
  let zones = [];
  try {
    await window.DBManager.ready;
    zones = await window.DBManager.getActiveZones();
    if (!zones || zones.length === 0) throw new Error('Aucune zone en DB');
  } catch {
    try { zones = await loadZonesLocally(); } catch {}
  }

  const zonesGrid = document.getElementById('zones-grid');
  if (!zonesGrid || zones.length === 0) return;
  zonesGrid.innerHTML = '';

  zones.forEach(zone => {
    const card = document.createElement('div');
    card.className = 'zone-card';
    card.onclick = () => goToZone(zone.qr_code);

    let icon = '📍';
    if (zone.batiment.includes('Sud'))  icon = '📘';
    else if (zone.batiment.includes('Nord')) icon = '🔬';
    else if (zone.batiment.includes('FB'))   icon = '💻';
    else if (zone.batiment.includes('Est'))  icon = '🏢';
    else if (zone.batiment.includes('C'))    icon = '🏛️';
    else if (zone.nom.includes('Internat'))  icon = '🛏️';
    else if (zone.nom.includes('Amphith'))   icon = '🎭';

    card.innerHTML = `
      <div class="zone-number">${zone.ordre || zone.id}</div>
      <div class="zone-icon">${icon}</div>
      <h3 class="zone-name">${zone.nom}</h3>
      <p class="zone-description">${zone.batiment}${zone.etage ? ' — ' + zone.etage : ''}</p>
      <button class="zone-btn">
        Découvrir
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    `;

    zonesGrid.appendChild(card);
  });
});
