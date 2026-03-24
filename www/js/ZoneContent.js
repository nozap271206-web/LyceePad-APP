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
      { name: 'Salle d étude', src: '../img/photo_salle_internat.png' },
      { name: 'chambre', src: '../img/photo_chambre_internat.png' }
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
  'QR_CDI_001':          { nom: 'CDI', batiment: 'Bâtiment C', etage: '1er étage', description: 'Centre de Documentation et d\'Information.', photos: ['/img/photo_CDI_1.png', '/img/photo_CDI_2.png'] },
  'QR_CAFET_001':        { nom: 'Cafétéria', batiment: 'Bâtiment C', etage: 'RDC', description: 'Espace de restauration et de convivialité.' },
  'QR_SUD_05':           { nom: 'Salle Sud 05', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Salle de cours - Bâtiment Sud.' },
  'QR_SUD_06':           { nom: 'Salle Sud 06', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Salle de cours - Bâtiment Sud.' },
  'QR_SUD_07':           { nom: 'Salle Sud 07', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Salle de cours - Bâtiment Sud.' },
  'QR_SUD_08':           { nom: 'Salle Sud 08', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Salle de cours - Bâtiment Sud.' },
  'QR_SUD_09':           { nom: 'Salle Sud 09', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Salle de cours - Bâtiment Sud.' },
  'QR_LABO_SUD':         { nom: 'Labo Sud', batiment: 'Bâtiment Sud', etage: 'RDC', description: 'Laboratoire - Bâtiment Sud.' },
  'QR_FB_10':            { nom: 'Salle FB 10', batiment: 'Bâtiment FB', etage: 'RDC', description: 'Salle de cours - Bâtiment FB.' },
  'QR_FB_11':            { nom: 'Salle FB 11', batiment: 'Bâtiment FB', etage: 'RDC', description: 'Salle de cours - Bâtiment FB.' },
  'QR_FB_20':            { nom: 'Salle FB 20', batiment: 'Bâtiment FB', etage: '1er étage', description: 'Salle de cours - Bâtiment FB.' },
  'QR_FB_21':            { nom: 'Salle FB 21', batiment: 'Bâtiment FB', etage: '1er étage', description: 'Salle de cours - Bâtiment FB.' },
  'QR_NORD_08':          { nom: 'Salle Nord 08', batiment: 'Bâtiment Nord', etage: 'RDC', description: 'Salle de cours - Bâtiment Nord.' },
  'QR_NORD_09':          { nom: 'Salle Nord 09', batiment: 'Bâtiment Nord', etage: 'RDC', description: 'Salle de cours - Bâtiment Nord.' },
  'QR_NORD_10':          { nom: 'Salle Nord 10', batiment: 'Bâtiment Nord', etage: 'RDC', description: 'Salle de cours - Bâtiment Nord.' },
  'QR_NORD_11':          { nom: 'Salle Nord 11', batiment: 'Bâtiment Nord', etage: 'RDC', description: 'Salle de cours - Bâtiment Nord.' },
  'QR_NORD_12':          { nom: 'Salle Nord 12', batiment: 'Bâtiment Nord', etage: '1er étage', description: 'Salle de cours - Bâtiment Nord.' },
  'QR_NORD_13':          { nom: 'Salle Nord 13', batiment: 'Bâtiment Nord', etage: '1er étage', description: 'Salle de cours - Bâtiment Nord.' },
  'QR_NORD_14':          { nom: 'Salle Nord 14', batiment: 'Bâtiment Nord', etage: '1er étage', description: 'Salle de cours - Bâtiment Nord.' },
  'QR_NORD_15':          { nom: 'Salle Nord 15', batiment: 'Bâtiment Nord', etage: '1er étage', description: 'Salle de cours - Bâtiment Nord.' },
  'QR_NORD_16':          { nom: 'Salle Nord 16', batiment: 'Bâtiment Nord', etage: '1er étage', description: 'Salle de cours - Bâtiment Nord.' },
  'QR_EST_11':           { nom: 'Salle Est 11', batiment: 'Bâtiment Est', etage: 'RDC', description: 'Salle de cours - Bâtiment Est.' },
  'QR_EST_12':           { nom: 'Salle Est 12', batiment: 'Bâtiment Est', etage: 'RDC', description: 'Salle de cours - Bâtiment Est.' },
  'QR_EST_13':           { nom: 'Salle Est 13', batiment: 'Bâtiment Est', etage: 'RDC', description: 'Salle de cours - Bâtiment Est.' },
  'QR_C_ETAGE_1':        { nom: 'Bâtiment C - 1er étage', batiment: 'Bâtiment C', etage: '1er étage', description: 'Premier étage - Bâtiment C.' },
  'QR_C_ETAGE_2':        { nom: 'Bâtiment C - 2ème étage', batiment: 'Bâtiment C', etage: '2ème étage', description: 'Second étage - Bâtiment C.' },
  'QR_C_ETAGE_3':        { nom: 'Bâtiment C - 3ème étage', batiment: 'Bâtiment C', etage: '3ème étage', description: 'Troisième étage - Bâtiment C.' },
  'QR_AMPHITHÉATRE_001': { nom: 'Amphithéâtre', batiment: '', etage: '', description: 'Amphithéâtre de l\'établissement.' },
  'QR_INTERNAT_001':     { nom: 'Internat', batiment: 'Internat', etage: '', description: 'Internat du lycée Saint-Éloi.', photos: ['/img/photo_salle_internat.png', '/img/photo_chambre_internat.png'], videos: ['/video/presentation_internat.mp4'] },
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

    const serverBase = (window.DBManager?.config?.serverUrl || '').replace(/\/data\/?$/, '');
    const resolveUrl = p => {
      if (!p) return null;
      if (p.startsWith('http')) return p;
      if (p.startsWith('/img/zones/')) return serverBase + p; // fichiers uploadés
      return p; // assets statiques, laisser le navigateur résoudre
    };
    const photoSources = (zone.photos && zone.photos.length > 0)
      ? zone.photos.map(resolveUrl).filter(Boolean)
      : (zone.image ? [resolveUrl(zone.image)] : []);

    if (photoSources.length > 0) {
      photoSources.forEach(src => {
        const photoDiv = document.createElement('div');
        photoDiv.className = 'gallery-item';
        photoDiv.innerHTML = `<img src="${src}" alt="${zone.nom}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;
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
    document.getElementById('quiz-link').href = `Quiz.html?zone=${zone.id}`;

    // Mettre à jour les titres médias et afficher la vidéo si disponible
    document.getElementById('video-title').textContent = `Visite de ${zone.nom}`;
    if (zone.videos && zone.videos.length > 0) {
      const videoSrc = zone.videos[0].startsWith('http') ? zone.videos[0] : serverBase + zone.videos[0];
      const placeholder = document.getElementById('video-placeholder');
      placeholder.innerHTML = `<video controls playsinline width="100%" style="border-radius:12px;display:block;"><source src="${videoSrc}"></video>`;
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
  document.getElementById('quiz-link').href = `Quiz.html?zone=${zoneId}`;

  // Mettre à jour les titres médias
  document.getElementById('video-title').textContent = zone.videoTitle;

  // Injecter la vidéo uniquement pour la zone internat (id=10)
  if (parseInt(zoneId) === 10) {
    const placeholder = document.getElementById('video-placeholder');
    placeholder.innerHTML = `<video controls playsinline width="100%" style="border-radius:12px;display:block;"><source src="../video/presentation_internat.mp4" type="video/mp4"></video>`;
  }
}