/**
 * Admin.js - Interface d'administration
 * Gestion des zones, contenus et synchronisation
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Initialiser DBManager
  await DBManager.init();

  // Éléments
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const zonesList = document.getElementById('zonesList');
  const searchZones = document.getElementById('searchZones');
  const btnAddZone = document.getElementById('btnAddZone');
  const modalZone = document.getElementById('modalZone');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCancelZone = document.getElementById('btnCancelZone');
  const btnSaveZone = document.getElementById('btnSaveZone');
  const formZone = document.getElementById('formZone');
  const btnForceSync = document.getElementById('btnForceSync');
  const btnPushChanges = document.getElementById('btnPushChanges');
  const btnResetLocal = document.getElementById('btnResetLocal');

  // QR Code  const qrGenerator = document.getElementById('qrGenerator');
  const qrCodeDisplay = document.getElementById('qrCodeDisplay');
  const btnDownloadQR = document.getElementById('btnDownloadQR');
  const btnRegenerateQR = document.getElementById('btnRegenerateQR');
  let qrCodeInstance = null;

  let allZones = [];
  let currentZone = null;

  // === GESTION QR CODE ===
  
  /**
   * Générer le QR code basé sur les informations du formulaire
   */
  function generateQRCode() {
    const qrCode = document.getElementById('zoneQrCode').value.trim();
    const nom = document.getElementById('zoneNom').value.trim();
    
    if (!qrCode) {
      qrGenerator.style.display = 'none';
      return;
    }

    // Données à encoder dans le QR code (format JSON)
    const qrData = {
      code: qrCode,
      nom: nom || 'Non défini',
      type: 'lyceepad_zone'
    };

    // Convertir en JSON
    const qrText = JSON.stringify(qrData);

    // Vider le display
    qrCodeDisplay.innerHTML = '';

    // Créer le QR code
    try {
      qrCodeInstance = new QRCode(qrCodeDisplay, {
        text: qrText,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });

      qrGenerator.style.display = 'block';
    } catch (error) {
      console.error('Erreur génération QR code:', error);
    }
  }

  /**
   * Télécharger le QR code en PNG
   */
  function downloadQRCode() {
    const qrCode = document.getElementById('zoneQrCode').value.trim();
    const canvas = qrCodeDisplay.querySelector('canvas');
    
    if (!canvas) {
      alert('Aucun QR code à télécharger');
      return;
    }

    // Convertir le canvas en image
    const image = canvas.toDataURL('image/png');
    
    // Créer un lien de téléchargement
    const link = document.createElement('a');
    link.download = `QR_${qrCode}.png`;
    link.href = image;
    link.click();
  }

  // Event listeners pour génération automatique
  document.getElementById('zoneQrCode').addEventListener('input', generateQRCode);
  document.getElementById('zoneNom').addEventListener('input', generateQRCode);
  
  btnDownloadQR.addEventListener('click', downloadQRCode);
  btnRegenerateQR.addEventListener('click', generateQRCode);

  // Gestion des tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Activer le bon tab
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Afficher le bon contenu
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${tabName}`) {
          content.classList.add('active');
        }
      });

      // Charger les données selon le tab
      if (tabName === 'zones') {
        loadZones();
      } else if (tabName === 'sync') {
        loadSyncStats();
      }
    });
  });

  // Charger les zones
  async function loadZones() {
    try {
      allZones = await DBManager.getAllZones();
      displayZones(allZones);
    } catch (error) {
      console.error('Erreur chargement zones:', error);
      addLog('error', 'Erreur de chargement des zones');
    }
  }

  // Afficher les zones
  function displayZones(zones) {
    if (zones.length === 0) {
      zonesList.innerHTML = `
        <div class="info-text">
          <i class="fas fa-inbox"></i>
          <p>Aucune zone trouvée. Créez-en une nouvelle !</p>
        </div>
      `;
      return;
    }

    zonesList.innerHTML = zones.map(zone => `
      <div class="zone-card" data-qr="${zone.qr_code}">
        <div class="zone-card-header">
          <h3 class="zone-card-title">${zone.nom}</h3>
          <span class="zone-card-qr">${zone.qr_code}</span>
        </div>
        <div class="zone-card-info">
          <p><i class="fas fa-building"></i> ${zone.batiment || 'Non défini'}</p>
          <p><i class="fas fa-layer-group"></i> Étage ${zone.etage !== null ? zone.etage : 'N/A'}</p>
          <p><i class="fas fa-map-marker-alt"></i> ${zone.coordonnees_gps ? `${zone.coordonnees_gps.lat}, ${zone.coordonnees_gps.lng}` : 'Pas de GPS'}</p>
          <p>
            <span class="status-badge ${zone.statut === 'active' ? 'active' : 'inactive'}">
              ${zone.statut === 'active' ? 'Active' : 'Inactive'}
            </span>
          </p>
        </div>
        <div class="zone-card-actions">
          <button class="btn btn-warning btn-edit" data-qr="${zone.qr_code}">
            <i class="fas fa-edit"></i> Modifier
          </button>
          <button class="btn btn-secondary btn-content" data-qr="${zone.qr_code}">
            <i class="fas fa-folder-open"></i> Contenus
          </button>
          <button class="btn btn-danger btn-delete" data-qr="${zone.qr_code}">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </div>
      </div>
    `).join('');

    // Event listeners sur les boutons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qrCode = e.currentTarget.dataset.qr;
        openZoneModal(qrCode);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qrCode = e.currentTarget.dataset.qr;
        deleteZone(qrCode);
      });
    });

    document.querySelectorAll('.btn-content').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qrCode = e.currentTarget.dataset.qr;
        // TODO: Ouvrir l'éditeur de contenu
        alert('Éditeur de contenu - À venir');
      });
    });
  }

  // Recherche de zones
  searchZones.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allZones.filter(zone => 
      zone.nom.toLowerCase().includes(query) ||
      zone.qr_code.toLowerCase().includes(query) ||
      (zone.batiment && zone.batiment.toLowerCase().includes(query))
    );
    displayZones(filtered);
  });

  // Ouvrir modal nouvelle zone
  btnAddZone.addEventListener('click', () => {
    currentZone = null;
    openZoneModal();
  });

  // Ouvrir modal édition zone
  async function openZoneModal(qrCode = null) {
    const modalTitle = document.getElementById('modalZoneTitle');
    
    if (qrCode) {
      // Mode édition
      currentZone = await DBManager.getZone(qrCode);
      modalTitle.textContent = 'Modifier la zone';
      
      // Remplir le formulaire
      document.getElementById('zoneId').value = currentZone.id;
      document.getElementById('zoneQrCode').value = currentZone.qr_code;
      document.getElementById('zoneQrCode').disabled = true; // QR code non modifiable
      document.getElementById('zoneNom').value = currentZone.nom;
      document.getElementById('zoneBatiment').value = currentZone.batiment || '';
      document.getElementById('zoneEtage').value = currentZone.etage !== null ? currentZone.etage : '';
      document.getElementById('zoneLatitude').value = currentZone.coordonnees_gps ? currentZone.coordonnees_gps.lat : '';
      document.getElementById('zoneLongitude').value = currentZone.coordonnees_gps ? currentZone.coordonnees_gps.lng : '';
      document.getElementById('zoneDescription').value = currentZone.description_courte || '';
      document.getElementById('zoneStatut').checked = currentZone.statut === 'active';
      
      // Générer le QR code pour la zone existante
      setTimeout(generateQRCode, 100);
    } else {
      // Mode création
      modalTitle.textContent = 'Nouvelle zone';
      formZone.reset();
      document.getElementById('zoneQrCode').disabled = false;
      document.getElementById('zoneStatut').checked = true;
      qrGenerator.style.display = 'none'; // Masquer le QR jusqu'à ce qu'on tape le code
    }

    modalZone.classList.add('active');
  }

  // Fermer modal
  function closeZoneModal() {
    modalZone.classList.remove('active');
    formZone.reset();
    currentZone = null;
    
    // Réinitialiser le QR code
    qrCodeDisplay.innerHTML = '';
    qrGenerator.style.display = 'none';
    qrCodeInstance = null;
  }

  btnCloseModal.addEventListener('click', closeZoneModal);
  btnCancelZone.addEventListener('click', closeZoneModal);

  // Cliquer en dehors de la modal
  modalZone.addEventListener('click', (e) => {
    if (e.target === modalZone) {
      closeZoneModal();
    }
  });

  // Sauvegarder zone
  btnSaveZone.addEventListener('click', async () => {
    const formData = {
      id: document.getElementById('zoneId').value || null,
      qr_code: document.getElementById('zoneQrCode').value.trim(),
      nom: document.getElementById('zoneNom').value.trim(),
      batiment: document.getElementById('zoneBatiment').value.trim() || null,
      etage: document.getElementById('zoneEtage').value ? parseInt(document.getElementById('zoneEtage').value) : null,
      coordonnees_gps: {
        lat: parseFloat(document.getElementById('zoneLatitude').value) || null,
        lng: parseFloat(document.getElementById('zoneLongitude').value) || null
      },
      description_courte: document.getElementById('zoneDescription').value.trim() || null,
      statut: document.getElementById('zoneStatut').checked ? 'active' : 'inactive'
    };

    // Validation
    if (!formData.qr_code || !formData.nom) {
      alert('Le code QR et le nom sont obligatoires');
      return;
    }

    try {
      btnSaveZone.disabled = true;
      btnSaveZone.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';

      if (currentZone) {
        // Mise à jour
        await DBManager.updateZone(formData);
        addLog('success', `Zone "${formData.nom}" mise à jour`);
      } else {
        // Création
        await DBManager.createZone(formData);
        addLog('success', `Zone "${formData.nom}" créée`);
      }

      closeZoneModal();
      loadZones();
    } catch (error) {
      console.error('Erreur sauvegarde zone:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
      addLog('error', 'Erreur sauvegarde zone: ' + error.message);
    } finally {
      btnSaveZone.disabled = false;
      btnSaveZone.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
    }
  });

  // Supprimer zone
  async function deleteZone(qrCode) {
    const zone = allZones.find(z => z.qr_code === qrCode);
    if (!zone) return;

    if (!confirm(`Supprimer la zone "${zone.nom}" ?\n\nCette action est irréversible.`)) {
      return;
    }

    try {
      await DBManager.deleteZone(qrCode);
      addLog('success', `Zone "${zone.nom}" supprimée`);
      loadZones();
    } catch (error) {
      console.error('Erreur suppression zone:', error);
      alert('Erreur lors de la suppression: ' + error.message);
      addLog('error', 'Erreur suppression zone: ' + error.message);
    }
  }

  // Charger stats synchronisation
  async function loadSyncStats() {
    const syncStats = document.getElementById('syncStats');
    const stats = await DBManager.getStats();

    syncStats.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${stats.zones}</div>
        <div class="stat-label">Zones</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.parcours}</div>
        <div class="stat-label">Parcours</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${stats.profils}</div>
        <div class="stat-label">Profils</div>
      </div>
      <div class="stat-card">
        <div class="stat-value ${DBManager.state.serverReachable ? 'text-success' : 'text-danger'}">
          ${DBManager.state.serverReachable ? '✓ En ligne' : '✗ Hors ligne'}
        </div>
        <div class="stat-label">Serveur</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${DBManager.state.lastPing || 'N/A'}</div>
        <div class="stat-label">Dernier ping</div>
      </div>
    `;
  }

  // Actions de synchronisation
  btnForceSync.addEventListener('click', async () => {
    try {
      btnForceSync.disabled = true;
      btnForceSync.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Synchronisation...';
      addLog('info', 'Téléchargement depuis serveur...');
      
      await DBManager.syncData();
      addLog('success', 'Synchronisation réussie');
      loadZones();
      loadSyncStats();
    } catch (error) {
      addLog('error', 'Erreur synchronisation: ' + error.message);
    } finally {
      btnForceSync.disabled = false;
      btnForceSync.innerHTML = '<i class="fas fa-download"></i> Télécharger depuis serveur';
    }
  });

  btnPushChanges.addEventListener('click', async () => {
    if (!confirm('Envoyer les modifications locales vers le serveur ?\n\nCela écrasera les données du serveur.')) {
      return;
    }

    try {
      btnPushChanges.disabled = true;
      btnPushChanges.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi...';
      addLog('info', 'Envoi vers serveur...');
      
      await DBManager.pushToServer();
      addLog('success', 'Données envoyées au serveur');
    } catch (error) {
      addLog('error', 'Erreur envoi: ' + error.message);
    } finally {
      btnPushChanges.disabled = false;
      btnPushChanges.innerHTML = '<i class="fas fa-upload"></i> Pousser vers serveur';
    }
  });

  btnResetLocal.addEventListener('click', async () => {
    if (!confirm('Réinitialiser la base de données locale ?\n\nToutes les modifications non synchronisées seront perdues.')) {
      return;
    }

    try {
      addLog('info', 'Réinitialisation de la base locale...');
      await DBManager.resetDatabase();
      await DBManager.syncData();
      addLog('success', 'Base locale réinitialisée');
      loadZones();
      loadSyncStats();
    } catch (error) {
      addLog('error', 'Erreur réinitialisation: ' + error.message);
    }
  });

  // Ajouter une entrée au log
  function addLog(type, message) {
    const logContent = document.getElementById('logContent');
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    const color = type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6';
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="log-timestamp">${timestamp}</span>
      <span style="color: ${color}">${icon}</span>
      ${message}
    `;
    
    logContent.insertBefore(entry, logContent.firstChild);

    // Limiter à 50 entrées
    while (logContent.children.length > 50) {
      logContent.removeChild(logContent.lastChild);
    }
  }

  // Charger initial
  loadZones();
  addLog('info', 'Interface admin chargée');
});
