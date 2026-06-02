// ZoneContent.js - Gestion des pages zones

// Données des zones
const zonesData = {
  1: {
    id: 1,
    title: 'Salles SUD',
    description: 'Salles dédiées aux étudiants BTS CIEL 1ère et 2ème année, options IR et ER',
    detailedInfo: [
      'Les salles SUD accueillent les étudiants de BTS CIEL (Cybersécurité, Informatique et réseaux, ELectronique) en 1ère et 2ème année, avec les options IR (Informatique et Réseaux) et ER (Électronique et Réseaux). Grâce à ses nombreux ordinateurs performants et son espace de travail modulable, cette salle constitue un environnement idéal pour réaliser des travaux pratiques en informatique, réseau et électronique. Équipée de postes informatiques modernes et d\'un réseau haut débit, elle permet aux étudiants de mettre en pratique leurs compétences techniques dans des conditions professionnelles.'
    ],
    photos: [
      { name: 'Salle de cours', color: 'linear-gradient(135deg, #2EA3F2 0%, #1a6fa8 100%)' },
      { name: 'Espace informatique', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
    ],
    videoTitle: 'Visite des salles SUD',
    audioTitle: 'Témoignage d\'un enseignant'
  },
  2: {
    id: 2,
    title: 'Salles NORD/MELEC',
    description: 'Salles de cours générales et ateliers électricité',
    detailedInfo: [
      'Les salles NORD/MELEC combinent enseignements généraux et formations techniques en électricité. Équipements modernes : vidéoprojecteurs, connexion internet, ateliers équipés. Formation complète aux métiers de l\'électricité et environnements connectés.'
    ],
    photos: [
      { name: 'Salle de classe', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
      { name: 'Atelier MELEC', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
    ],
    videoTitle: 'Découverte des salles NORD/MELEC',
    audioTitle: 'Interview d\'élèves'
  },
  4: {
    id: 4,
    title: 'Salles BTS PME',
    description: 'Espaces dédiés au BTS Professions Immobilières et Management',
    detailedInfo: [
      'Salles configurées pour les enseignements tertiaires : économie, gestion, droit. Équipements adaptés aux simulations professionnelles et aux études de cas. Espace collaboratif favorisant le travail en groupe et les projets d\'entreprise.'
    ],
    photos: [
      { name: 'Salle de cours', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
      { name: 'Espace informatique', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
    ],
    videoTitle: 'Présentation des salles BTS PME',
    audioTitle: 'Témoignage d\'un étudiant'
  },
  6: {
    id: 6,
    title: 'Bâtiment Principal',
    description: 'Accueil, administration et services du lycée',
    detailedInfo: [
      'Le bâtiment principal regroupe l\'accueil, l\'administration, la vie scolaire et les bureaux. Point d\'information pour les visiteurs, parents et futurs élèves. Services administratifs : inscriptions, scolarité, intendance.'
    ],
    photos: [
      { name: 'Hall d\'accueil', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
      { name: 'Administration', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
    ],
    videoTitle: 'Découverte du bâtiment principal',
    audioTitle: 'Présentation des services'
  },
  8: {
    id: 8,
    title: 'Salles BAC Pro',
    description: 'Salles dédiées aux formations professionnelles',
    detailedInfo: [
      'Salles adaptées aux différentes filières professionnelles du lycée. Équipements spécifiques selon les métiers : ateliers, postes informatiques, matériel technique. Pédagogie axée sur la pratique.'
    ],
    photos: [
      { name: 'Salle de cours', color: 'linear-gradient(135deg, #2EA3F2 0%, #1a6fa8 100%)' },
      { name: 'Atelier informatique', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }
    ],
    videoTitle: 'Présentation des salles BAC Pro',
    audioTitle: 'Témoignage d\'un élève'
  },
  9: {
    id: 9,
    title: 'Théâtre',
    description: 'Salle de spectacle et d\'expression artistique',
    detailedInfo: [
      'Salle équipée pour les représentations théâtrales, concerts et événements culturels. Matériel son et lumière professionnel. Lieu de pratique pour les ateliers théâtre.'
    ],
    photos: [
      { name: 'Scène', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
      { name: 'Gradins', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
    ],
    videoTitle: 'Visite du théâtre',
    audioTitle: 'Interview du responsable culturel'
  },
  10: {
    id: 10,
    title: 'Internat',
    description: 'Hébergement pour les élèves internes',
    detailedInfo: [
      'L\'internat accueille les élèves éloignés dans un cadre sécurisé et convivial. Chambres confortables avec connexion internet. Encadrement éducatif et accompagnement personnalisé.'
    ],
    photos: [
      { name: 'Salle d étude', src: '/img/photo_salle_internat.png' },
      { name: 'chambre', src: '/img/photo_chambre_internat.png' }
    ],
    videoTitle: 'Découverte de l\'internat',
    audioTitle: 'Témoignage d\'un interne'
  }
};

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
  // Récupérer l'ID ou le QR code de la zone depuis l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const zoneId = urlParams.get('id');
  const qrCode = urlParams.get('qr');

  if (!zoneId && !qrCode) {
    alert('Aucune zone spécifiée');
    window.location.href = 'map.html';
    return;
  }

  // Si on a un QR code, charger depuis DBManager
  if (qrCode) {
    await loadZoneFromDB(qrCode);
  } else {
    // Sinon utiliser les anciennes données en dur
    loadZoneContent(zoneId);
  }
});

// Fallback statique (offline / IndexedDB vide)
const ZONES_FALLBACK = {
  'QR_HALL_001':         { nom: 'Hall d\'accueil/Vie scolaire', batiment: '', etage: '', description: 'Point d\'entrée principal du lycée avec personnel d\'accueil.' },
  'QR_CDI_001':          { nom: 'CDI', batiment: 'Bâtiment C', etage: '1er étage', description: 'Centre de Documentation et d\'Information.', photos: ['/img/photo_CDI_1.png', '/img/photo_CDI_2.png'], videos: ['/video/Presentation_CDI.mp4'] },
  'QR_CAFET_001':        { nom: 'Cafétéria', batiment: 'Bâtiment C', etage: 'RDC', description: 'Espace de restauration et de convivialité.', photos: ['/img/Refectoire.jpg'], noVideo: true },
  'QR_SUD_05':           { nom: 'Salle Sud 05', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Salle de cours - Bâtiment Sud.', noVideo: true },
  'QR_SUD_06':           { nom: 'Salle Sud 06', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Salle de cours - Bâtiment Sud.', noVideo: true },
  'QR_SUD_07':           { nom: 'Salle Sud 07', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Salle de cours - Bâtiment Sud.', photos: ['/img/Sud-7.jpg'], videos: ['/video/Ago.mp4'] },
  'QR_SUD_08':           { nom: 'Salle Sud 08', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Salle de cours - Bâtiment Sud.', photos: ['/img/Sud-8.jpg'], videos: ['/video/Guillemain.mp4'] },
  'QR_SUD_09':           { nom: 'Salle Sud 09', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Salle de cours - Bâtiment Sud.' },
  'QR_LABO_SUD':         { nom: 'Labo Sud', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Laboratoire - Bâtiment Sud.', photos: ['/img/Labo-sud.jpg'] },
  'QR_FB_10':            { nom: 'Salle FB 10', batiment: 'Bâtiment FB', etage: 'RDC', description: 'Salle de cours - Bâtiment FB.', noVideo: true },
  'QR_FB_11':            { nom: 'Salle FB 11', batiment: 'Bâtiment FB', etage: 'RDC', description: 'Salle de cours - Bâtiment FB.', noVideo: true },
  'QR_FB_20':            { nom: 'Salle FB 20', batiment: 'Bâtiment FB', etage: '1er étage', description: 'Salle de cours - Bâtiment FB.', noVideo: true },
  'QR_FB_21':            { nom: 'Salle FB 21', batiment: 'Bâtiment FB', etage: '1er étage', description: 'Salle de cours - Bâtiment FB.', noVideo: true },
  'QR_NORD_08':          { nom: 'Salle Nord 08', batiment: 'Bâtiment Nord', etage: 'RDC', description: 'Salle de cours - Bâtiment Nord.', noVideo: true },
  'QR_NORD_09':          { nom: 'Salle Nord 09', batiment: 'Bâtiment Nord', etage: 'RDC', description: 'Salle de cours - Bâtiment Nord.', noVideo: true },
  'QR_NORD_10':          { nom: 'Salle Nord 10', batiment: 'Bâtiment Nord', etage: 'RDC', description: 'Salle de cours - Bâtiment Nord.', noVideo: true },
  'QR_NORD_11':          { nom: 'Salle Nord 11', batiment: 'Bâtiment Nord', etage: 'RDC', description: 'Salle de cours - Bâtiment Nord.', noVideo: true },
  'QR_NORD_12':          { nom: 'Salle Nord 12', batiment: 'Bâtiment Nord', etage: '1er étage', description: 'Salle de cours - Bâtiment Nord.', noVideo: true },
  'QR_NORD_13':          { nom: 'Salle Nord 13', batiment: 'Bâtiment Nord', etage: '1er étage', description: 'Salle de cours - Bâtiment Nord.', noVideo: true },
  'QR_NORD_14':          { nom: 'Salle Nord 14', batiment: 'Bâtiment Nord', etage: '1er étage', description: 'Salle de cours - Bâtiment Nord.', noVideo: true },
  'QR_NORD_15':          { nom: 'Salle Nord 15', batiment: 'Bâtiment Nord', etage: '1er étage', description: 'Salle de cours - Bâtiment Nord.', noVideo: true },
  'QR_NORD_16':          { nom: 'Salle Nord 16', batiment: 'Bâtiment Nord', etage: '1er étage', description: 'Salle de cours - Bâtiment Nord.', noVideo: true },
  'QR_EST_11':           { nom: 'Salle Est 11', batiment: 'Bâtiment Est', etage: 'RDC', description: 'Salle de cours - Bâtiment Est.', noVideo: true },
  'QR_EST_12':           { nom: 'Salle Est 12', batiment: 'Bâtiment Est', etage: 'RDC', description: 'Salle de cours - Bâtiment Est.', noVideo: true },
  'QR_EST_13':           { nom: 'Salle Est 13', batiment: 'Bâtiment Est', etage: 'RDC', description: 'Salle de cours - Bâtiment Est.', noVideo: true },
  'QR_C_ETAGE_1':        { nom: 'Bâtiment C - 1er étage', batiment: 'Bâtiment C', etage: '1er étage', description: 'Premier étage - Bâtiment C.', noVideo: true },
  'QR_C_ETAGE_2':        { nom: 'Bâtiment C - 2ème étage', batiment: 'Bâtiment C', etage: '2ème étage', description: 'Second étage - Bâtiment C.', noVideo: true },
  'QR_C_ETAGE_3':        { nom: 'Bâtiment C - 3ème étage', batiment: 'Bâtiment C', etage: '3ème étage', description: 'Troisième étage - Bâtiment C.', noVideo: true },
  'QR_AMPHITHÉATRE_001': { nom: 'Amphithéâtre', batiment: '', etage: '', description: 'Amphithéâtre de l\'établissement.', photos: ['/img/Theatre-1.jpg', '/img/Theatre-2.jpg'], noVideo: true },
  'QR_INTERNAT_001':     { nom: 'Internat', batiment: 'Internat', etage: '', description: 'Internat du lycée Saint-Éloi.', photos: ['/img/photo_salle_internat.png', '/img/photo_chambre_internat.png'], videos: ['/video/presentation_internat.mp4'] },
};

// Mapping QR code → ID du quiz correspondant (clés de quizData dans Quiz.js)
const QR_TO_QUIZ_ID = {
  'QR_SUD_05': 1, 'QR_SUD_06': 1, 'QR_SUD_07': 1, 'QR_SUD_09': 1, 'QR_LABO_SUD': 1,
  'QR_SUD_08': 3, // Salle Sud 08 → BTS CIEL ER
  'QR_NORD_08': 2, 'QR_NORD_09': 2, 'QR_NORD_10': 2, 'QR_NORD_11': 2, 'QR_NORD_12': 2,
  'QR_NORD_13': 2, 'QR_NORD_14': 2, 'QR_NORD_15': 2, 'QR_NORD_16': 2,
  'QR_CDI_001': 6,
  'QR_AMPHITHÉATRE_001': 9,
  'QR_INTERNAT_001': 10,
};

// Mapping ID de zone (base de données) → ID du quiz (pour le chemin ?id=)
const DB_ID_TO_QUIZ_ID = {
  4: 1, 5: 1, 6: 1, 8: 1, 9: 1, // Sud 05-07, 09, Labo → CIEL IR
  7: 3,                            // Sud 08 → CIEL ER
  14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 2, 21: 2, 22: 2, // Nord → BTS MS
  2: 6,                            // CDI
  29: 9,                           // Amphithéâtre
  30: 10,                          // Internat
};

async function loadZoneFromDB(qrCode) {
  try {
    // Attendre que DBManager soit initialisé
    if (!window.DBManager || !window.DBManager.state.db) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Récupérer la zone depuis DBManager
    let zone = await window.DBManager.getZone(qrCode);

    // Fallback statique si IndexedDB vide (offline)
    if (!zone && ZONES_FALLBACK[qrCode]) {
      const f = ZONES_FALLBACK[qrCode];
      zone = { nom: f.nom, batiment: f.batiment, etage: f.etage, description: f.description, image: null, photos: f.photos || null, videos: f.videos || null, coordonnees: null };
    }

    // Enrichir avec les médias statiques si la DB n'en a pas
    if (zone && ZONES_FALLBACK[qrCode]) {
      const f = ZONES_FALLBACK[qrCode];
      if ((!zone.photos || zone.photos.length === 0) && f.photos) zone.photos = f.photos;
      if ((!zone.videos || zone.videos.length === 0) && f.videos) zone.videos = f.videos;
      if (f.noVideo) zone.noVideo = true;
    }

    if (!zone) {
      alert('Zone non trouvée : ' + qrCode);
      window.location.href = 'map.html';
      return;
    }

    console.log('Zone chargée depuis DB:', zone);

    // Mettre à jour le titre de la page
    document.title = `${zone.nom} - LycéePad`;

    // Remplir le hero
    document.getElementById('zone-badge').textContent = zone.batiment || 'Zone';
    document.getElementById('zone-title').textContent = zone.nom;
    document.getElementById('zone-description').textContent = zone.description;

    // Remplir la galerie photos
    const galleryGrid = document.getElementById('gallery-grid');
    galleryGrid.innerHTML = '';

    const isCordova = window.location.hostname === 'localhost';
    const serverBase = isCordova
      ? 'https://lycee-pad.cc'
      : (window.DBManager?.config?.serverUrl || '').replace(/\/data\/?$/, '');
    // Pour les médias uploadés, toujours utiliser le serveur configuré (IP locale en Cordova)
    const uploadServerBase = (window.DBManager?.config?.serverUrl || '').replace(/\/data\/?$/, '') || serverBase;
    const resolveUrl = p => {
      if (!p) return null;
      if (p.startsWith('http')) return p;
      if (p.startsWith('../')) p = '/' + p.slice(3);
      if (isCordova && (p.startsWith('/video/') || p.startsWith('/img/'))) return serverBase + p;
      if (p.startsWith('/img/zones/') || p.startsWith('/video/zones/')) return serverBase + p;
      return p;
    };
    const photoSources = (zone.photos && zone.photos.length > 0)
      ? zone.photos.map(resolveUrl).filter(Boolean)
      : (zone.image ? [resolveUrl(zone.image)] : []);

    if (photoSources.length > 0) {
      photoSources.forEach(src => {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'gallery-item';
        photoDiv.innerHTML = `<img src="${src}" alt="${zone.nom}" loading="lazy" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
        galleryGrid.appendChild(photoDiv);
      });
    } else {
      const photoDiv = document.createElement('div');
      photoDiv.className = 'gallery-item';
      photoDiv.innerHTML = `
        <div class="gallery-placeholder" style="background: linear-gradient(135deg, #2EA3F2 0%, #1a6fa8 100%)">
          <div class="placeholder-icon">🖼️</div>
          <span class="placeholder-label">${zone.nom}</span>
        </div>
      `;
      galleryGrid.appendChild(photoDiv);
    }

    // Charger les photos/vidéos uploadées depuis le serveur
    try {
      const uploadUrl = `${uploadServerBase}/API/upload.php?qr_code=${encodeURIComponent(qrCode)}`;
      const uploadRes = await fetch(uploadUrl, { cache: 'no-cache' });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.files && uploadData.files.length > 0) {
          // Supprimer le placeholder bleu si des photos uploadées existent (quelle que soit la source statique)
          const hasUploadedGalleryPhotos = uploadData.files.some(f => f.type === 'image' && f.role !== 'hero');
          if (hasUploadedGalleryPhotos) {
            const placeholder = galleryGrid.querySelector('.gallery-placeholder');
            if (placeholder) placeholder.closest('.gallery-item').remove();
          }
          uploadData.files.forEach(f => {
            const fullUrl = uploadServerBase + f.url;
            if (f.type === 'image') {
              if (f.role === 'hero') {
                const heroEl = document.querySelector('.zone-hero');
                if (heroEl) {
                  heroEl.style.backgroundImage = `url('${fullUrl}')`;
                  heroEl.style.backgroundSize = 'cover';
                  heroEl.style.backgroundPosition = 'center';
                }
              } else {
                const photoDiv = document.createElement('div');
                photoDiv.className = 'gallery-item';
                const img = document.createElement('img');
                img.alt = zone.nom;
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:12px;';
                img.src = fullUrl;
                photoDiv.appendChild(img);
                galleryGrid.appendChild(photoDiv);
              }
            } else if (f.type === 'video' && !zone.noVideo && (!zone.videos || zone.videos.length === 0)) {
              const placeholder = document.getElementById('video-placeholder');
              if (placeholder) {
                placeholder.innerHTML = `<video controls playsinline preload="metadata" width="100%" style="border-radius:12px;display:block;"><source src="${fullUrl}" type="video/mp4"></video>`;
              }
            }
          });
        }
      }
    } catch (e) {
      console.warn('Photos uploadées non disponibles:', e.message);
    }

    // Remplir la description détaillée
    const descriptionContent = document.getElementById('description-content');
    descriptionContent.innerHTML = '';
    
    const p = document.createElement('p');
    p.className = 'description-text';
    p.innerHTML = `
      <strong>Bâtiment :</strong> ${zone.batiment || 'Non spécifié'}<br>
      <strong>Étage :</strong> ${zone.etage || 'Non spécifié'}<br><br>
      ${zone.description}
    `;
    descriptionContent.appendChild(p);

    // Afficher les coordonnées si disponibles
    if (zone.coordonnees) {
      const coordP = document.createElement('p');
      coordP.className = 'description-text';
      coordP.innerHTML = `<strong>Coordonnées GPS :</strong> ${zone.coordonnees.lat}, ${zone.coordonnees.lng}`;
      descriptionContent.appendChild(coordP);
    }

    // Mettre à jour le texte du quiz
    document.getElementById('quiz-text').textContent = `Répondez au quiz sur ${zone.nom}`;
    const quizId = QR_TO_QUIZ_ID[qrCode];
    document.getElementById('quiz-link').href = quizId ? `Quiz.html?zone=${quizId}` : 'Quiz.html';

    // Section vidéo : masquer si noVideo, sinon afficher (avec vidéo si disponible)
    const videoSection = document.getElementById('video-section');
    if (zone.noVideo && videoSection) {
      videoSection.style.display = 'none';
    } else {
      const videoTitleEl = document.getElementById('video-title');
      if (videoTitleEl) videoTitleEl.textContent = `Visite de ${zone.nom}`;
      if (zone.videos && zone.videos.length > 0) {
        const videoSrc = resolveUrl(zone.videos[0]);
        const placeholder = document.getElementById('video-placeholder');
        if (placeholder) {
          if (isCordova) {
            // Dans Cordova Android le WebView bloque les vidéos cross-origin → bouton direct
            const btn = document.createElement('div');
            btn.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:2rem;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:12px;color:white;';
            btn.innerHTML = '<div style="width:70px;height:70px;background:#2EA3F2;border-radius:50%;display:flex;align-items:center;justify-content:center;"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg></div><span style="font-size:1rem;font-weight:600;">Lancer la vidéo</span><span style="font-size:0.8rem;opacity:0.7;">S\'ouvre dans le navigateur</span>';
            btn.addEventListener('click', function() { window.open(videoSrc, '_system'); });
            placeholder.innerHTML = '';
            placeholder.appendChild(btn);
          } else {
            const video = document.createElement('video');
            video.controls = true;
            video.setAttribute('playsinline', '');
            video.preload = 'metadata';
            video.style.cssText = 'border-radius:12px;display:block;width:100%';
            video.src = videoSrc;
            const showFallback = function() {
              placeholder.innerHTML = '';
              const btn = document.createElement('div');
              btn.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:2rem;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:12px;color:white;';
              btn.innerHTML = '<div style="width:70px;height:70px;background:#2EA3F2;border-radius:50%;display:flex;align-items:center;justify-content:center;"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg></div><span style="font-size:1rem;font-weight:600;">Lancer la vidéo</span>';
              btn.addEventListener('click', function() { window.open(videoSrc, '_blank'); });
              placeholder.appendChild(btn);
            };
            video.addEventListener('error', showFallback);
            placeholder.innerHTML = '';
            placeholder.appendChild(video);
          }
        }
      }
    }

  } catch (err) {
    console.error('Erreur chargement zone:', err);
    alert('Erreur lors du chargement de la zone');
    window.location.href = 'map.html';
  }
}

function loadZoneContent(zoneId) {
  // Récupérer les données de la zone
  const zone = zonesData[zoneId];

  if (!zone) {
    alert('Zone non trouvée');
    window.location.href = 'map.html';
    return;
  }

  // Mettre à jour le titre de la page
  document.title = `${zone.title} - LycéePad`;

  // Remplir le hero
  document.getElementById('zone-badge').textContent = `Zone ${zone.id}`;
  document.getElementById('zone-title').textContent = zone.title;
  document.getElementById('zone-description').textContent = zone.description;

  // Remplir la galerie photos
  const galleryGrid = document.getElementById('gallery-grid');
  galleryGrid.innerHTML = '';
  
  zone.photos.forEach(photo => {
    const photoDiv = document.createElement('div');
    photoDiv.className = 'gallery-item';
    if (photo.src) {
      photoDiv.innerHTML = `
        <img src="${photo.src}" alt="${photo.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">
      `;
    } else {
      photoDiv.innerHTML = `
        <div class="gallery-placeholder" style="background: ${photo.color}">
          <div class="placeholder-icon">🖼️</div>
          <span class="placeholder-label">${photo.name}</span>
        </div>
      `;
    }
    galleryGrid.appendChild(photoDiv);
  });

  // Remplir la description
  const descriptionContent = document.getElementById('description-content');
  descriptionContent.innerHTML = '';
  
  zone.detailedInfo.forEach(paragraph => {
    const p = document.createElement('p');
    p.className = 'description-text';
    p.textContent = paragraph;
    descriptionContent.appendChild(p);
  });

  // Mettre à jour le texte du quiz
  document.getElementById('quiz-text').textContent = `Répondez au quiz sur ${zone.title}`;
  const quizIdForZone = DB_ID_TO_QUIZ_ID[parseInt(zoneId)];
  document.getElementById('quiz-link').href = quizIdForZone ? `Quiz.html?zone=${quizIdForZone}` : 'Quiz.html';

  // Mettre à jour les titres médias
  document.getElementById('video-title').textContent = zone.videoTitle;

  // Injecter la vidéo uniquement pour la zone internat (id=10)
  if (parseInt(zoneId) === 10) {
    const placeholder = document.getElementById('video-placeholder');
    if (placeholder) {
      const internatSrc = 'https://lycee-pad.cc/video/presentation_internat.mp4';
      const video = document.createElement('video');
      video.controls = true;
      video.setAttribute('playsinline', '');
      video.preload = 'metadata';
      video.style.cssText = 'border-radius:12px;display:block;width:100%';
      const source = document.createElement('source');
      source.src = internatSrc;
      source.type = 'video/mp4';
      video.appendChild(source);
      video.addEventListener('error', function() {
        placeholder.innerHTML = '';
        const btn = document.createElement('div');
        btn.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:2rem;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:12px;color:white;';
        btn.innerHTML = '<div style="width:70px;height:70px;background:#2EA3F2;border-radius:50%;display:flex;align-items:center;justify-content:center;"><svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg></div><span style="font-size:1rem;font-weight:600;">Lancer la vidéo</span>';
        btn.addEventListener('click', function() { window.open(internatSrc, '_system'); });
        placeholder.appendChild(btn);
      });
      placeholder.innerHTML = '';
      placeholder.appendChild(video);
    }
  }
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
const lightbox = {
  el: null, img: null, counter: null, prev: null, next: null,
  sources: [], index: 0,

  init() {
    this.el      = document.getElementById('lightbox');
    this.img     = document.getElementById('lightboxImg');
    this.counter = document.getElementById('lightboxCounter');
    this.prev    = document.getElementById('lightboxPrev');
    this.next    = document.getElementById('lightboxNext');
    if (!this.el) return;

    document.getElementById('lightboxClose').addEventListener('click',   () => this.close());
    document.getElementById('lightboxBackdrop').addEventListener('click', () => this.close());
    this.prev.addEventListener('click', () => this.go(this.index - 1));
    this.next.addEventListener('click', () => this.go(this.index + 1));

    document.addEventListener('keydown', e => {
      if (!this.el.classList.contains('open')) return;
      if (e.key === 'Escape')      this.close();
      if (e.key === 'ArrowLeft')   this.go(this.index - 1);
      if (e.key === 'ArrowRight')  this.go(this.index + 1);
    });

    // Swipe tactile
    let tx = 0;
    this.el.addEventListener('touchstart', e => { tx = e.touches[0].clientX; },        { passive: true });
    this.el.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) this.go(this.index + (dx < 0 ? 1 : -1));
    });
  },

  open(sources, index) {
    this.sources = sources;
    this.go(index, false);
    this.el.style.display = 'flex';
    this.el.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  close() {
    this.el.style.display = 'none';
    this.el.classList.remove('open');
    document.body.style.overflow = '';
  },

  go(index, animate = true) {
    const n = this.sources.length;
    if (!n) return;
    this.index = ((index % n) + n) % n;

    if (animate) {
      this.img.classList.add('fading');
      setTimeout(() => {
        this.img.src = this.sources[this.index];
        this.img.classList.remove('fading');
      }, 150);
    } else {
      this.img.src = this.sources[this.index];
    }

    this.counter.textContent = n > 1 ? `${this.index + 1} / ${n}` : '';
    this.prev.classList.toggle('hidden', n <= 1);
    this.next.classList.toggle('hidden', n <= 1);
  }
};

// Un seul listener par délégation sur gallery-grid — couvre photos statiques
// ET photos uploadées dynamiquement sans modifier le code de rendu existant.
function bindGalleryLightbox() {
  const grid = document.getElementById('gallery-grid');
  if (!grid || grid.dataset.lightboxBound) return;
  grid.dataset.lightboxBound = 'true';

  grid.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;
    const img = item.querySelector('img');
    if (!img || !img.src || img.src === window.location.href) return;
    const allImgs = [...grid.querySelectorAll('.gallery-item img')]
      .filter(i => i.src && i.src !== window.location.href);
    lightbox.open(allImgs.map(i => i.src), allImgs.indexOf(img));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  lightbox.init();
  bindGalleryLightbox();
});