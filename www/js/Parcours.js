/**
 * Parcours.js - Sélection de parcours de visite
 * Charge les profils, parcours et zones depuis l'API PHP
 */

const ParcoursPage = {

  data: null,          // Données complètes chargées de l'API
  selectedProfil: null,
  selectedParcours: null,

  // Mapping icônes FA selon le nom du profil
  iconMap: {
    futur_eleve:   'fa-graduation-cap',
    parent:        'fa-users',
    partenaire:    'fa-handshake',
    visiteur_libre:'fa-person-walking',
  },

  get apiUrl() {
    return '../API/parcours.php';
  },

  async init() {
    await this.loadData();
    this.renderProfils();
    this.bindEvents();
  },

  // ── Chargement des données ─────────────────────────────────────────────────
  async loadData() {
    const grid = document.getElementById('profilsGrid');

    try {
      const res  = await fetch(`${this.apiUrl}?action=all`, { cache: 'no-cache' });
      const json = await res.json();

      if (!json.success) throw new Error(json.message);
      this.data = json.data;

    } catch (err) {
      console.warn('API indisponible, utilisation des données locales :', err.message);
      // Fallback : données statiques depuis IndexedDB (db-manager)
      this.data = await this.buildFallbackData();
    }
  },

  // Fallback si l'API est hors ligne — construit depuis IndexedDB
  async buildFallbackData() {
    try {
      const zones = await DBManager.getAllZones();
      return [
        {
          id_profil:   1,
          nom_profil:  'futur_eleve',
          description: 'Futur élève souhaitant découvrir le lycée',
          couleur:     '#2EA3F2',
          icon:        'student-icon',
          parcours:    [
            {
              id_parcours:    1,
              nom_parcours:   'Visite libre',
              description:    'Découvrez toutes les zones du lycée',
              duree_estimee:  null,
              zones:          zones.slice(0, 5).map((z, i) => ({
                id_zone:     z.id || i + 1,
                nom_zone:    z.nom || z.nom_zone,
                description: z.description || '',
                qr_code:     z.qr_code,
                batiment:    z.batiment || '',
                etage:       z.etage || '',
                ordre_visite: i + 1
              }))
            }
          ]
        }
      ];
    } catch {
      return [];
    }
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

    if (title)   title.textContent = parcours.nom_parcours;

    const zones  = parcours.zones || [];
    const duree  = parcours.duree_estimee ? `${parcours.duree_estimee} min` : 'Durée libre';
    const profil = this.data.find(p => p.id_profil === this.selectedProfil.id_profil);
    const color  = profil ? profil.couleur : '#2EA3F2';

    if (summary) {
      summary.innerHTML = `
        <div class="parcours-summary-icon"><i class="fas fa-route"></i></div>
        <div class="parcours-summary-info">
          <h3>${parcours.nom_parcours}</h3>
          <p>${parcours.description || 'Parcours de visite du lycée Saint-Éloi'}</p>
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
            <span class="zone-step-qr">${z.qr_code}</span>
          </div>
        </div>`;
    }).join('');
  },

  // ── Navigation entre étapes ────────────────────────────────────────────────
  showStep(stepId) {
    document.querySelectorAll('.parcours-step').forEach(s => s.classList.add('hidden'));
    document.getElementById(stepId)?.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      this.renderParcours(this.selectedProfil);
      this.showStep('stepParcours');
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

    // Retour au profil
    document.getElementById('btnBackProfil')?.addEventListener('click', () => {
      this.showStep('stepProfil');
    });

    // Retour au parcours
    document.getElementById('btnBackParcours')?.addEventListener('click', () => {
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
