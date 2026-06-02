/**
 * Parcours.js - Sélection de parcours de visite
 * Charge les profils, parcours et zones depuis l'API PHP
 * Étape 1.5 : sélection formation (pour profil futur_eleve)
 */

const ParcoursPage = {

  data: null,          // Données complètes chargées de l'API
  formations: [],      // Liste des formations chargées
  selectedProfil: null,
  selectedFormation: null,
  selectedParcours: null,

  // Mapping icônes FA selon le nom du profil
  iconMap: {
    futur_eleve:   'fa-graduation-cap',
    parent:        'fa-users',
    partenaire:    'fa-handshake',
    visiteur_libre:'fa-person-walking',
  },

  // Couleurs par niveau de formation
  niveauColors: {
    'CAP':           '#f59e0b',
    'Bac Pro':       '#f97316',
    'Baccalauréat':  '#10b981',
    'BTS':           '#2EA3F2',
    'Prépa':         '#8b5cf6',
  },

  get apiUrl() { return '../API/parcours.php'; },
  get apiFormations() { return '../API/formations.php'; },

  async init() {
    await Promise.all([this.loadData(), this.loadFormations()]);
    this.renderProfils();
    this.bindEvents();
  },

  // ── Chargement des données ─────────────────────────────────────────────────
  async loadData() {
    // Données custom sauvegardées depuis l'admin (priorité maximale)
    try {
      const custom = localStorage.getItem('lyceepad_parcours_custom');
      if (custom) {
        this.data = JSON.parse(custom);
        return;
      }
    } catch {}

    try {
      const res  = await fetch(`${this.apiUrl}?action=all`, { cache: 'no-cache' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      this.data = json.data;
    } catch (err) {
      console.warn('API indisponible, utilisation des données locales :', err.message);
      this.data = await this.buildFallbackData();
    }
  },

  async loadFormations() {
    try {
      const res  = await fetch(`${this.apiFormations}?action=all`, { cache: 'no-cache' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      this.formations = json.data;
    } catch (err) {
      console.warn('Formations API indisponible :', err.message);
      this.formations = [];
    }
  },

  // Fallback statique si l'API est hors ligne
  async buildFallbackData() {
    return [
      {
        id_profil: 1, nom_profil: 'futur_eleve',
        description: 'Futur élève souhaitant découvrir le lycée',
        couleur: '#2EA3F2',
        parcours: [
          {
            id_parcours: 1, nom_parcours: 'Découverte BTS CIEL',
            description: 'Parcours complet pour découvrir la formation BTS Cybersécurité, Informatique et Réseaux',
            duree_estimee: 45,
            zones: [
              { id_zone: 1,  nom_zone: 'Hall d\'accueil/Vie scolaire', description: 'Point d\'entrée principal du lycée', batiment: '', etage: '', ordre_visite: 1 },
              { id_zone: 6,  nom_zone: 'Salle Sud 07', description: 'Salle de cours BTS CIEL IR - Bâtiment Sud', batiment: 'Bâtiment Sud', etage: 'RDC', ordre_visite: 2 },
              { id_zone: 7,  nom_zone: 'Salle Sud 08', description: 'Salle de cours BTS CIEL ER - Bâtiment Sud', batiment: 'Bâtiment Sud', etage: 'RDC', ordre_visite: 3 },
              { id_zone: 14, nom_zone: 'Salle Nord 08', description: 'Salle de cours - Bâtiment Nord', batiment: 'Bâtiment Nord', etage: 'RDC', ordre_visite: 4 },
              { id_zone: 2,  nom_zone: 'CDI', description: 'Centre de Documentation et d\'Information', batiment: 'Bâtiment C', etage: '1er étage', ordre_visite: 5 }
            ]
          }
        ]
      },
      {
        id_profil: 2, nom_profil: 'parent',
        description: 'Parent accompagnant',
        couleur: '#10B981',
        parcours: [
          {
            id_parcours: 2, nom_parcours: 'Visite parents',
            description: 'Découvrez les espaces clés du lycée',
            duree_estimee: 30,
            zones: [
              { id_zone: 1, nom_zone: 'Hall d\'accueil/Vie scolaire', description: 'Point d\'entrée principal du lycée', batiment: '', etage: '', ordre_visite: 1 },
              { id_zone: 2, nom_zone: 'CDI', description: 'Centre de Documentation et d\'Information', batiment: 'Bâtiment C', etage: '1er étage', ordre_visite: 2 },
              { id_zone: 3, nom_zone: 'Cafétéria', description: 'Espace de restauration et de convivialité', batiment: 'Bâtiment C', etage: 'RDC', ordre_visite: 3 },
              { id_zone: 4, nom_zone: 'Administration', description: 'Espace administratif', batiment: 'Bâtiment C', etage: '1er étage', ordre_visite: 4}
            ]
          }
        ]
      },
      {
        id_profil: 3, nom_profil: 'visiteur_libre',
        description: 'Visiteur sans profil spécifique',
        couleur: '#6B7280',
        parcours: [
          {
            id_parcours: 3, nom_parcours: 'Visite libre',
            description: 'Découvrez toutes les zones du lycée à votre rythme',
            duree_estimee: null,
            zones: [
              { id_zone: 1,  nom_zone: 'Hall d\'accueil/Vie scolaire', description: 'Point d\'entrée principal', batiment: '', etage: '', ordre_visite: 1 },
              { id_zone: 29, nom_zone: 'Amphithéatre', description: 'Amphithéatre de l\'établissement', batiment: '', etage: '', ordre_visite: 2 },
              { id_zone: 2,  nom_zone: 'CDI', description: 'Centre de Documentation et d\'Information', batiment: 'Bâtiment C', etage: '1er étage', ordre_visite: 3 },
              { id_zone: 3,  nom_zone: 'Cafétéria', description: 'Espace de restauration', batiment: 'Bâtiment C', etage: 'RDC', ordre_visite: 4 },
              { id_zone: 30, nom_zone: 'Internat', description: 'Internat lié au lycée', batiment: 'Internat', etage: '', ordre_visite: 5 }
            ]
          }
        ]
      },
      {
        id_profil: 4, nom_profil: 'partenaire',
        description: 'Partenaire professionnel',
        couleur: '#8B5CF6',
        parcours: [
          {
            id_parcours: 4, nom_parcours: 'Visite partenaires',
            description: 'Présentation des plateaux techniques et équipements',
            duree_estimee: 35,
            zones: [
              { id_zone: 1,  nom_zone: 'Hall d\'accueil/Vie scolaire', description: 'Point d\'entrée principal du lycée', batiment: '', etage: '', ordre_visite: 1 },
              { id_zone: 9,  nom_zone: 'Administration', description: 'Espace administratif - Premier étage', batiment: 'Bâtiment C', etage: '1er étage', ordre_visite: 2 }
              
            ]
          }
        ]
      },
    ];
  },

  // ── Rendu profils ──────────────────────────────────────────────────────────
  renderProfils() {
    const grid = document.getElementById('profilsGrid');
    if (!grid || !this.data) return;

    if (this.data.length === 0) {
      grid.innerHTML = '<div class="loading-placeholder"><i class="fas fa-exclamation-triangle"></i> Aucun profil disponible.</div>';
      return;
    }

    grid.innerHTML = this.data.map(profil => {
      const icon  = this.iconMap[profil.nom_profil] || 'fa-user';
      const color = profil.couleur || '#2EA3F2';
      const label = this.formatLabel(profil.nom_profil);
      const count = (profil.parcours || []).length;

      return `
        <div class="profil-card" data-profil="${profil.id_profil}"
             style="--profil-color: ${color}">
          <div class="profil-icon" style="background:${color}">
            <i class="fas ${icon}"></i>
          </div>
          <div class="profil-name">${label}</div>
          <div class="profil-desc">${profil.description || ''}</div>
          ${count > 0 ? `<div class="profil-desc" style="margin-top:8px;color:var(--primary);font-weight:600;">${count} parcours disponible${count > 1 ? 's' : ''}</div>` : ''}
        </div>`;
    }).join('');
  },

  // ── Rendu formations ───────────────────────────────────────────────────────
  renderFormations() {
    const grid = document.getElementById('formationsGrid');
    if (!grid) return;

    if (this.formations.length === 0) {
      grid.innerHTML = '<div class="loading-placeholder"><i class="fas fa-exclamation-triangle"></i> Aucune formation disponible.</div>';
      return;
    }

    grid.innerHTML = this.formations.map(f => {
      const color = this.niveauColors[f.niveau] || '#2EA3F2';
      return `
        <div class="formation-card" data-formation="${f.id_formation}">
          <span class="formation-niveau" style="color:${color};background:color-mix(in srgb,${color} 12%,var(--bg-alt))">${f.niveau}</span>
          <div class="formation-name">${f.nom_formation}</div>
          <div class="formation-duree"><i class="fas fa-clock"></i> ${f.duree || ''}</div>
        </div>`;
    }).join('') + `
      <div class="formation-skip">
        <button class="btn-skip" id="btnSkipFormation">
          <i class="fas fa-forward"></i> Voir tous les parcours
        </button>
      </div>`;
  },

  // ── Rendu parcours ─────────────────────────────────────────────────────────
  renderParcours(profil) {
    const grid = document.getElementById('parcoursGrid');
    if (!grid) return;

    const parcoursList = profil.parcours || [];

    if (parcoursList.length === 0) {
      grid.innerHTML = `
        <div class="parcours-empty">
          <i class="fas fa-map"></i>
          Aucun parcours disponible pour ce profil.
        </div>`;
      return;
    }

    grid.innerHTML = parcoursList.map(p => {
      const duree  = p.duree_estimee ? `${p.duree_estimee} min` : 'Durée libre';
      const nZones = (p.zones || []).length;

      return `
        <div class="parcours-card" data-parcours="${p.id_parcours}">
          <div class="parcours-card-header">
            <div class="parcours-card-title">${p.nom_parcours}</div>
            <span class="parcours-badge"><i class="fas fa-clock"></i> ${duree}</span>
          </div>
          <div class="parcours-desc">${p.description || 'Parcours de visite du lycée'}</div>
          <div class="parcours-meta">
            <span><i class="fas fa-map-marker-alt"></i> ${nZones} zone${nZones > 1 ? 's' : ''}</span>
            <span><i class="fas fa-clock"></i> ${duree}</span>
          </div>
        </div>`;
    }).join('');
  },

  // ── Rendu zones ────────────────────────────────────────────────────────────
  renderZones(parcours) {
    const timeline = document.getElementById('zonesTimeline');
    const summary  = document.getElementById('parcoursSummary');
    const title    = document.getElementById('stepZonesTitle');
    if (!timeline) return;

    if (title) title.textContent = parcours.nom_parcours;

    const zones = parcours.zones || [];
    const duree = parcours.duree_estimee ? `${parcours.duree_estimee} min` : 'Durée libre';

    // Badge formation sélectionnée dans le résumé
    const formationBadge = this.selectedFormation
      ? `<span style="font-size:0.8rem;opacity:0.85"><i class="fas fa-graduation-cap"></i> ${this.selectedFormation.nom_formation}</span>`
      : '';

    if (summary) {
      summary.innerHTML = `
        <div class="parcours-summary-icon"><i class="fas fa-route"></i></div>
        <div class="parcours-summary-info">
          <h3>${parcours.nom_parcours}</h3>
          <p>${parcours.description || 'Parcours de visite du lycée Saint-Éloi'}</p>
          ${formationBadge}
        </div>
        <div class="parcours-summary-stats">
          <div class="summary-stat">
            <div class="summary-stat-value">${zones.length}</div>
            <div class="summary-stat-label">Zones</div>
          </div>
          <div class="summary-stat">
            <div class="summary-stat-value">${parcours.duree_estimee || '?'}</div>
            <div class="summary-stat-label">Minutes</div>
          </div>
        </div>`;
    }

    if (zones.length === 0) {
      timeline.innerHTML = '<div class="parcours-empty"><i class="fas fa-map-marked-alt"></i> Aucune zone dans ce parcours.</div>';
      return;
    }

    timeline.innerHTML = zones.map((z, i) => {
      const batiment = z.batiment ? `<span><i class="fas fa-building"></i> ${z.batiment}</span>` : '';
      const etage    = z.etage    ? `<span><i class="fas fa-layer-group"></i> ${z.etage}</span>`    : '';

      return `
        <div class="zone-step">
          <div class="zone-step-number">${i + 1}</div>
          <div class="zone-step-content">
            <div class="zone-step-name">${z.nom_zone}</div>
            <div class="zone-step-meta">
              ${batiment}${etage}
              ${z.description ? `<span>${z.description}</span>` : ''}
            </div>
            ${z.qr_code ? `<span class="zone-step-qr">${z.qr_code}</span>` : ''}
          </div>
        </div>`;
    }).join('');
  },

  // ── Navigation entre étapes ────────────────────────────────────────────────
  showStep(stepId) {
    // Scoper au seul onglet "parcours guidé" pour ne pas affecter l'onglet "toutes les zones"
    document.querySelectorAll('#tab-parcours .parcours-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(stepId)?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Numéros dynamiques : l'étape formation n'existe que si futur_eleve ET formations disponibles
    const hasFormationStep = this.selectedProfil?.nom_profil === 'futur_eleve' && this.formations.length > 0;
    const stepParcoursNum  = document.getElementById('stepParcoursNumber');
    const stepZonesNum     = document.getElementById('stepZonesNumber');
    if (stepParcoursNum) stepParcoursNum.textContent = hasFormationStep ? '3' : '2';
    if (stepZonesNum)    stepZonesNum.textContent    = hasFormationStep ? '4' : '3';
  },

  bindEvents() {
    // Sélection profil
    document.getElementById('profilsGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.profil-card');
      if (!card) return;

      const profilId = parseInt(card.dataset.profil);
      this.selectedProfil = this.data.find(p => p.id_profil === profilId);
      if (!this.selectedProfil) return;

      document.querySelectorAll('.profil-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      // Futur élève → étape formations
      if (this.selectedProfil.nom_profil === 'futur_eleve' && this.formations.length > 0) {
        this.selectedFormation = null;
        this.renderFormations();
        this.showStep('stepFormation');
        // Lier les events de la grille formations (après rendu)
        this._bindFormationEvents();
      } else {
        this.selectedFormation = null;
        this.renderParcours(this.selectedProfil);
        this.showStep('stepParcours');
      }
    });

    // Sélection parcours
    document.getElementById('parcoursGrid').addEventListener('click', (e) => {
      const card = e.target.closest('.parcours-card');
      if (!card) return;

      const parcoursId = parseInt(card.dataset.parcours);
      this.selectedParcours = (this.selectedProfil.parcours || [])
        .find(p => p.id_parcours === parcoursId);
      if (!this.selectedParcours) return;

      this.renderZones(this.selectedParcours);
      this.showStep('stepZones');
    });

    // Retour depuis parcours
    document.getElementById('btnBackProfil')?.addEventListener('click', () => {
      // Si futur_eleve, retourner à la sélection formation
      if (this.selectedProfil?.nom_profil === 'futur_eleve' && this.formations.length > 0) {
        this.showStep('stepFormation');
      } else {
        this.showStep('stepProfil');
      }
    });

    // Retour depuis formation vers profil
    document.getElementById('btnBackProfilFromFormation')?.addEventListener('click', () => {
      this.showStep('stepProfil');
    });

    // Retour au parcours
    document.getElementById('btnBackParcours')?.addEventListener('click', () => {
      this.showStep('stepParcours');
    });
  },

  _bindFormationEvents() {
    const grid = document.getElementById('formationsGrid');
    if (!grid) return;

    // Éviter double-bind
    grid.replaceWith(grid.cloneNode(true));
    const newGrid = document.getElementById('formationsGrid');

    newGrid.addEventListener('click', (e) => {
      // Bouton "Voir tous les parcours"
      if (e.target.closest('#btnSkipFormation')) {
        this.selectedFormation = null;
        this.renderParcours(this.selectedProfil);
        this.showStep('stepParcours');
        return;
      }

      const card = e.target.closest('.formation-card');
      if (!card) return;

      const formationId = parseInt(card.dataset.formation);
      this.selectedFormation = this.formations.find(f => f.id_formation === formationId);
      if (!this.selectedFormation) return;

      document.querySelectorAll('.formation-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      this.renderParcours(this.selectedProfil);
      this.showStep('stepParcours');
    });
  },

  // ── Utilitaire : formater le nom du profil ─────────────────────────────────
  formatLabel(nom) {
    const labels = {
      futur_eleve:    'Futur élève',
      parent:         'Parent',
      partenaire:     'Partenaire professionnel',
      visiteur_libre: 'Visiteur libre',
    };
    return labels[nom] || nom.replace(/_/g, ' ');
  }
};

document.addEventListener('DOMContentLoaded', () => ParcoursPage.init());
