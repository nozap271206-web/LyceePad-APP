/**
 * Depot.js - Banque de médias libre (onglet "Dépôt" de l'Admin)
 * Permet de déposer des fichiers (PDF, images) depuis n'importe quel PC connecté
 * et de les retrouver/parcourir. Upload/suppression : connexion admin requise.
 */

const DepotManager = {

  /** URL de l'API dépôt (même serveur que db-manager, robuste si serverUrl vide) */
  get apiUrl() {
    const base = (window.DBManager?.config?.serverUrl || '').replace(/\/data\/?$/, '');
    return (base || '') + '/API/depot.php';
  },

  /** Origine absolue pour construire des URLs copiables/ouvrables hors de la page */
  get origin() {
    const base = (window.DBManager?.config?.serverUrl || '').replace(/\/data\/?$/, '');
    return base || window.location.origin;
  },

  get authHeader() {
    const token = localStorage.getItem('lyceepad_auth_token') || '';
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  },

  init() {
    this._buildUI();
    this._bindEvents();
  },

  _buildUI() {
    const tab = document.getElementById('tab-depot');
    if (!tab) return;
    tab.innerHTML = `
      <div class="action-bar">
        <div class="search-box">
          <i class="fas fa-info-circle"></i>
          <span style="color:var(--text-secondary);font-size:0.9rem">
            Déposez des fichiers (PDF, images, vidéos) — ils sont stockés sur le serveur et accessibles à tous.
          </span>
        </div>
      </div>

      <div style="border:2px dashed var(--border);border-radius:12px;padding:1.5rem;text-align:center;margin-bottom:1.5rem;background:var(--bg-elevated)">
        <input type="file" id="depotFileInput" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.ogg,.mov,image/*,video/*,application/pdf" style="display:none">
        <button class="btn btn-primary" id="depotPickBtn">
          <i class="fas fa-cloud-upload-alt"></i> Choisir des fichiers à déposer
        </button>
        <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.75rem">PDF, images, vidéos — 500 Mo max par fichier</p>
        <div id="depotProgress" style="display:none;margin-top:1rem">
          <div style="background:var(--border);border-radius:8px;overflow:hidden;height:10px">
            <div id="depotProgressBar" style="height:100%;width:0%;background:var(--primary);transition:width .2s"></div>
          </div>
          <p id="depotProgressTxt" style="color:var(--text-secondary);font-size:0.85rem;margin-top:0.5rem"></p>
        </div>
      </div>

      <div id="depotList">
        <div class="info-text"><i class="fas fa-spinner fa-spin"></i> Chargement du dépôt...</div>
      </div>
    `;
  },

  _bindEvents() {
    const pickBtn = document.getElementById('depotPickBtn');
    const input   = document.getElementById('depotFileInput');
    if (pickBtn && input) {
      pickBtn.addEventListener('click', () => input.click());
      input.addEventListener('change', () => {
        if (input.files && input.files.length) this.upload(input.files);
      });
    }
  },

  async loadFiles() {
    const list = document.getElementById('depotList');
    if (list) list.innerHTML = '<div class="info-text"><i class="fas fa-spinner fa-spin"></i> Chargement du dépôt...</div>';
    try {
      const res  = await fetch(`${this.apiUrl}?_=${Date.now()}`, { cache: 'no-cache' });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Erreur API');
      this._renderGrid(json.files || []);
    } catch (err) {
      if (list) list.innerHTML = `<p style="color:var(--danger);padding:1rem">Impossible de charger le dépôt : ${err.message}</p>`;
    }
  },

  _renderGrid(files) {
    const list = document.getElementById('depotList');
    if (!list) return;

    if (!files.length) {
      list.innerHTML = `<p style="color:var(--text-secondary);padding:1rem">Aucun fichier dans le dépôt pour le moment.</p>`;
      return;
    }

    list.innerHTML = `
      <h3 style="margin:0 0 1rem;color:var(--text)">${files.length} fichier(s) dans le dépôt</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:1rem">
        ${files.map(f => this._card(f)).join('')}
      </div>
    `;
  },

  _card(f) {
    const full   = this.origin + f.url;
    const sizeKb = f.size ? (f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' Mo' : Math.round(f.size / 1024) + ' Ko') : '';
    const isApp  = f.source === 'app';   // média déjà présent dans l'app → lecture seule

    let preview;
    if (f.type === 'pdf') {
      preview = `<div style="height:120px;display:flex;align-items:center;justify-content:center;background:var(--bg);color:#e74c3c"><i class="fas fa-file-pdf" style="font-size:3rem"></i></div>`;
    } else if (f.type === 'video') {
      preview = `<video src="${full}" muted preload="metadata" style="width:100%;height:120px;object-fit:cover;display:block;background:#000"></video>`;
    } else {
      preview = `<div style="height:120px;background:var(--bg) url('${full}') center/cover no-repeat"></div>`;
    }

    const typeLabel = f.type === 'pdf' ? 'PDF' : (f.type === 'video' ? 'Vidéo' : 'Image');
    const badge = isApp
      ? `<span style="position:absolute;top:6px;left:6px;background:rgba(0,0,0,0.6);color:#fff;font-size:0.65rem;padding:2px 6px;border-radius:4px;z-index:1">app</span>`
      : '';
    const deleteBtn = isApp
      ? ''
      : `<button class="btn btn-danger" onclick="DepotManager.deleteFile('${f.name.replace(/'/g, "\\'")}')" style="padding:0.35rem 0.6rem;font-size:0.78rem" title="Supprimer"><i class="fas fa-trash"></i></button>`;

    return `
      <div class="zone-card" style="overflow:hidden;position:relative">
        ${badge}
        <a href="${full}" target="_blank" rel="noopener" title="Ouvrir">${preview}</a>
        <div style="padding:0.6rem 0.75rem">
          <p style="margin:0 0 0.4rem;font-size:0.82rem;color:var(--text);word-break:break-all" title="${f.name}">${f.name}</p>
          <p style="margin:0 0 0.6rem;font-size:0.75rem;color:var(--text-secondary)">${typeLabel} · ${sizeKb}${isApp ? " · déjà dans l'app" : ''}</p>
          <div style="display:flex;gap:0.4rem;flex-wrap:wrap">
            <a class="btn btn-secondary" href="${full}" target="_blank" rel="noopener" style="padding:0.35rem 0.6rem;font-size:0.78rem"><i class="fas fa-external-link-alt"></i></a>
            <button class="btn btn-secondary" onclick="DepotManager.copyUrl('${full}')" style="padding:0.35rem 0.6rem;font-size:0.78rem" title="Copier le lien"><i class="fas fa-link"></i></button>
            ${deleteBtn}
          </div>
        </div>
      </div>
    `;
  },

  async upload(fileList) {
    const progress    = document.getElementById('depotProgress');
    const progressBar = document.getElementById('depotProgressBar');
    const progressTxt = document.getElementById('depotProgressTxt');

    if (!localStorage.getItem('lyceepad_auth_token')) {
      alert('Vous devez être connecté en admin pour déposer des fichiers.');
      return;
    }

    if (progress) progress.style.display = 'block';
    let done = 0;
    const total = fileList.length;

    for (const file of fileList) {
      if (progressTxt) progressTxt.textContent = `Envoi ${done + 1}/${total} : ${file.name}`;
      if (progressBar) progressBar.style.width = `${Math.round((done / total) * 100)}%`;

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res  = await fetch(this.apiUrl, {
          method:  'POST',
          headers: this.authHeader,
          body:    formData
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      } catch (err) {
        alert(`Erreur dépôt "${file.name}" : ${err.message}`);
      }

      done++;
      if (progressBar) progressBar.style.width = `${Math.round((done / total) * 100)}%`;
    }

    if (progressTxt) progressTxt.textContent = `${done} fichier(s) déposé(s) !`;
    setTimeout(() => {
      if (progress) progress.style.display = 'none';
      if (progressBar) progressBar.style.width = '0%';
    }, 1500);

    const input = document.getElementById('depotFileInput');
    if (input) input.value = '';

    await this.loadFiles();
  },

  async deleteFile(filename) {
    if (!confirm(`Supprimer "${filename}" du serveur ?`)) return;
    try {
      const res  = await fetch(this.apiUrl, {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json', ...this.authHeader },
        body:    JSON.stringify({ filename })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      await this.loadFiles();
    } catch (err) {
      alert('Erreur suppression : ' + err.message);
    }
  },

  copyUrl(url) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(
        () => alert('Lien copié :\n' + url),
        () => prompt('Copiez le lien :', url)
      );
    } else {
      prompt('Copiez le lien :', url);
    }
  }
};

window.DepotManager = DepotManager;

document.addEventListener('DOMContentLoaded', () => {
  DepotManager.init();

  // Charger le dépôt quand on ouvre l'onglet
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === 'depot') DepotManager.loadFiles();
    });
  });
});
