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
      { name: 'Salle de cours', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
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
      { name: 'Salle de cours', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
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
      { name: 'Chambres', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
      { name: 'Salle d\'étude', color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
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

async function loadZoneFromDB(qrCode) {
  try {
    // Attendre que DBManager soit initialisé
    if (!window.DBManager || !window.DBManager.state.db) {
      console.log('Attente initialisation DBManager...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Récupérer la zone depuis DBManager
    const zone = await window.DBManager.getZone(qrCode);
    
    if (!zone) {
      alert('Zone non trouvée');
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
    
    // Photo principale si disponible
    if (zone.image) {
      const photoDiv = document.createElement('div');
      photoDiv.className = 'gallery-item';
      photoDiv.innerHTML = `
        <img src="${zone.image}" alt="${zone.nom}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
      `;
      galleryGrid.appendChild(photoDiv);
    } else {
      // Placeholder par défaut
      const photoDiv = document.createElement('div');
      photoDiv.className = 'gallery-item';
      photoDiv.innerHTML = `
        <div class="gallery-placeholder" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
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

    // Mettre à jour les titres médias
    document.getElementById('video-title').textContent = `Visite de ${zone.nom}`;
    document.getElementById('audio-title').textContent = `En savoir plus sur ${zone.nom}`;

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
    photoDiv.innerHTML = `
      <div class="gallery-placeholder" style="background: ${photo.color}">
        <div class="placeholder-icon">🖼️</div>
        <span class="placeholder-label">${photo.name}</span>
      </div>
    `;
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
  document.getElementById('audio-title').textContent = zone.audioTitle;
}