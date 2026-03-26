/**
 * Contenus.js - Gestion des médias par zone avec upload vers serveur
 */

const ContenusManager = {

  currentQrCode: null,

  /**
   * URL de base de l'API upload (même serveur que db-manager)
   */
  get uploadApiUrl() {
    return DBManager.config.serverUrl.replace('/data', '/API/upload.php');
  },

  /**
   * Initialiser l'onglet Contenus dans l'interface Admin
   */
  init() {
    this._buildUI();
    this._bindEvents();
  },

  /**
   * Construire l'interface de l'onglet Contenus
   */
  _buildUI() {
    const editor = document.getElementById('contentEditor');
    if (!editor) return;

    editor.innerHTML = `
      <div class="content-zone-selector">
        <label for="selectZoneContenus">
          <i class="fas fa-map-marker-alt"></i> Zone à gérer
        </label>
        <select id="selectZoneContenus">
          <option value="">-- Sélectionner une zone --</option>
        </select>
      </div>

      <div id="contenusPanel" style="display:none;">
        <div class="media-upload-bar">
          <label class="btn btn-primary" id="btnAddPhoto" style="cursor:pointer;">
            <i class="fas fa-image"></i> Ajouter photo(s)
            <input type="file" id="inputPhoto" accept="image/*" multiple style="display:none;">
          </label>
          <label class="btn btn-success" id="btnAddVideo" style="cursor:pointer;">
            <i class="fas fa-video"></i> Ajouter vidéo(s)
            <input type="file" id="inputVideo" accept="video/*" multiple style="display:none;">
          </label>
          <button class="btn btn-secondary" id="btnRefreshMedia">
            <i class="fas fa-sync-alt"></i> Actualiser
          </button>
        </div>

        <div class="upload-progress" id="uploadProgress">
          <span id="uploadProgressText">Envoi en cours...</span>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" id="uploadProgressBar"></div>
          </div>
        </div>

        <div class="media-grid" id="mediaGrid"></div>
      </div>
    `;
  },

  /**
   * Attacher les événements
   */
  _bindEvents() {
    const select = document.getElementById('selectZoneContenus');
    if (select) {
      select.addEventListener('change', (e) => {
        this.currentQrCode = e.target.value || null;
        if (this.currentQrCode) {
          document.getElementById('contenusPanel').style.display = 'block';
          this.loadMedia();
        } else {
          document.getElementById('contenusPanel').style.display = 'none';
        }
      });
    }

    const inputPhoto = document.getElementById('inputPhoto');
    if (inputPhoto) {
      inputPhoto.addEventListener('change', (e) => this._handleFiles(e.target.files));
    }

    const inputVideo = document.getElementById('inputVideo');
    if (inputVideo) {
      inputVideo.addEventListener('change', (e) => this._handleFiles(e.target.files));
    }

    const btnRefresh = document.getElementById('btnRefreshMedia');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => this.loadMedia());
    }
  },

  /**
   * Remplir le sélecteur de zones
   */
  async populateZoneSelect() {
    const select = document.getElementById('selectZoneContenus');
    if (!select) return;

    try {
      const zones = await DBManager.getAllZones();
      select.innerHTML = '<option value="">-- Sélectionner une zone --</option>';
      zones.forEach(zone => {
        const opt = document.createElement('option');
        opt.value = zone.qr_code;
        opt.textContent = `${zone.nom} (${zone.qr_code})`;
        if (zone.qr_code === this.currentQrCode) opt.selected = true;
        select.appendChild(opt);
      });
    } catch (err) {
      console.error('Erreur chargement zones pour contenus:', err);
    }
  },

  /**
   * Charger les médias d'une zone depuis le serveur
   */
  async loadMedia() {
    if (!this.currentQrCode) return;

    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    // Vérifier si le serveur est accessible
    if (!DBManager.state.serverReachable) {
      grid.innerHTML = `
        <div class="info-text">
          <i class="fas fa-wifi-slash"></i>
          <p>Serveur inaccessible — médias non disponibles hors ligne.</p>
        </div>`;
      return;
    }

    grid.innerHTML = `<div class="info-text"><i class="fas fa-spinner fa-spin"></i><p>Chargement...</p></div>`;

    try {
      const url = `${this.uploadApiUrl}?qr_code=${encodeURIComponent(this.currentQrCode)}`;
      const res  = await fetch(url, { cache: 'no-cache' });
      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      this._renderMedia(data.files);
    } catch (err) {
      grid.innerHTML = `
        <div class="info-text">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erreur lors du chargement : ${err.message}</p>
        </div>`;
    }
  },

  /**
   * Afficher les médias dans la grille
   */
  _renderMedia(files) {
    const grid = document.getElementById('mediaGrid');
    if (!grid) return;

    if (!files || files.length === 0) {
      grid.innerHTML = `
        <div class="info-text">
          <i class="fas fa-photo-video"></i>
          <p>Aucun média pour cette zone.<br>Ajoutez des photos ou vidéos ci-dessus.</p>
        </div>`;
      return;
    }

    // Construire l'URL absolue vers le serveur
    const serverBase = DBManager.config.serverUrl.replace('/data', '');

    grid.innerHTML = files.map(f => {
      const fullUrl = serverBase + f.url;
      const sizeKb  = Math.round(f.size / 1024);

      if (f.type === 'video') {
        return `
          <div class="media-item" data-filename="${f.name}">
            <video src="${fullUrl}" preload="metadata" muted></video>
            <div class="media-item-info">
              <div class="media-item-name">${f.name}</div>
              <span>${sizeKb} Ko · vidéo</span>
            </div>
            <button class="media-item-delete" title="Supprimer" onclick="ContenusManager.deleteMedia('${f.name}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>`;
      } else {
        return `
          <div class="media-item" data-filename="${f.name}">
            <img src="${fullUrl}" alt="${f.name}" loading="lazy">
            <div class="media-item-info">
              <div class="media-item-name">${f.name}</div>
              <span>${sizeKb} Ko · image</span>
            </div>
            <button class="media-item-delete" title="Supprimer" onclick="ContenusManager.deleteMedia('${f.name}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>`;
      }
    }).join('');
  },

  /**
   * Gérer les fichiers sélectionnés → upload
   */
  async _handleFiles(files) {
    if (!this.currentQrCode) {
      alert('Sélectionnez une zone avant d\'ajouter des médias.');
      return;
    }

    if (!DBManager.state.serverReachable) {
      alert('Serveur inaccessible — impossible d\'uploader les fichiers.\nVérifiez la connexion réseau.');
      return;
    }

    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    const progress    = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('uploadProgressBar');
    const progressTxt = document.getElementById('uploadProgressText');

    progress.classList.add('visible');
    let done = 0;

    for (const file of fileList) {
      progressTxt.textContent = `Upload ${done + 1}/${fileList.length} : ${file.name}`;
      progressBar.style.width = `${Math.round((done / fileList.length) * 100)}%`;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('qr_code', this.currentQrCode);

        const res  = await fetch(this.uploadApiUrl, { method: 'POST', body: formData });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);
        console.log('Upload OK:', data.file.name);
      } catch (err) {
        console.error('Upload échoué pour', file.name, ':', err.message);
        alert(`Erreur upload "${file.name}" : ${err.message}`);
      }

      done++;
      progressBar.style.width = `${Math.round((done / fileList.length) * 100)}%`;
    }

    progressTxt.textContent = `${done} fichier(s) uploadé(s) !`;
    setTimeout(() => {
      progress.classList.remove('visible');
      progressBar.style.width = '0%';
    }, 1500);

    // Réinitialiser les inputs
    document.getElementById('inputPhoto').value = '';
    document.getElementById('inputVideo').value = '';

    // Recharger la grille
    await this.loadMedia();
  },

  /**
   * Supprimer un média
   */
  async deleteMedia(filename) {
    if (!confirm(`Supprimer le fichier "${filename}" du serveur ?`)) return;

    try {
      const res  = await fetch(this.uploadApiUrl, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ qr_code: this.currentQrCode, filename })
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.message);
      await this.loadMedia();
    } catch (err) {
      alert('Erreur suppression : ' + err.message);
    }
  }
};

// Exposer globalement
window.ContenusManager = ContenusManager;

// Initialiser quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  ContenusManager.init();

  // Remplir le select quand on arrive sur l'onglet Contenus
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === 'contenus') {
        ContenusManager.populateZoneSelect();
      }
    });
  });
});
