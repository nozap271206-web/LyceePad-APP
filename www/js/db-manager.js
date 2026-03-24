/**
 * DB Manager - Gestionnaire de base de données hybride
 * Synchronisation serveur → IndexedDB avec fallback local
 */

const DBManager = {
  // Configuration
  config: {
    serverUrl: 'http://192.168.15.38/data',
    versionFile: 'db-version.json',
    dataFile: 'qr-data.json',
    localDataPath: '../data/qr-data.json',
    dbName: 'LyceePadDB',
    dbVersion: 1,
    storeName: 'zones'
  },

  // État
  state: {
    isOnline: navigator.onLine,
    serverReachable: false,
    db: null,
    currentVersion: null,
    lastSync: null,
    lastPing: null,
    useFallback: false
  },

  // Intervalle de ping
  pingInterval: null,

  /**
   * Initialisation du gestionnaire
   */
  async init() {
    this.loadServerUrl();
    
    // Écouter les changements de connexion
    window.addEventListener('online', () => this.handleOnlineStatus(true));
    window.addEventListener('offline', () => this.handleOnlineStatus(false));

    try {
      // Ouvrir IndexedDB
      await this.openDatabase();
      
      // Vérifier et synchroniser les données
      await this.syncData();
      
      // Démarrer le ping périodique du serveur (toutes les 10 secondes)
      this.startPeriodicPing(10000);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation DB Manager:', error);
      this.state.useFallback = true;
      return false;
    }
  },

  /**
   * Ouvrir la base IndexedDB
   */
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.state.db = request.result;
        resolve(this.state.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Créer le store pour les zones si nécessaire
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          const objectStore = db.createObjectStore(this.config.storeName, { keyPath: 'qr_code' });
          objectStore.createIndex('id', 'id', { unique: true });
          objectStore.createIndex('nom', 'nom', { unique: false });
          objectStore.createIndex('batiment', 'batiment', { unique: false });
        }

        // Store pour les métadonnées
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }

        // Store pour les parcours
        if (!db.objectStoreNames.contains('parcours')) {
          db.createObjectStore('parcours', { keyPath: 'id' });
        }

        // Store pour les profils
        if (!db.objectStoreNames.contains('profils')) {
          db.createObjectStore('profils', { keyPath: 'id' });
        }
      };
    });
  },

  /**
   * Synchroniser les données depuis le serveur
   */
  async syncData() {
    if (!this.state.isOnline) {
      await this.loadLocalData();
      return;
    }

    try {
      // Vérifier la version sur le serveur
      const serverVersion = await this.checkServerVersion();
      const localVersion = await this.getLocalVersion();


      // Télécharger si nouvelle version ou pas de données locales
      if (!localVersion || serverVersion !== localVersion) {
        await this.downloadAndStore();
        await this.saveMetadata('version', serverVersion);
        await this.saveMetadata('lastSync', new Date().toISOString());
        
        // Déclencher un événement personnalisé
        window.dispatchEvent(new CustomEvent('datasynced', {
          detail: { version: serverVersion }
        }));
      }
    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
      try { await this.loadLocalData(); } catch (_) {
        console.warn('Données locales inaccessibles (mode file://), fallback statique actif');
      }
    }
  },

  /**
   * Ping le serveur pour vérifier sa disponibilité
   */
  async pingServer() {
    const startTime = Date.now();
    
    try {
      // Créer une requête avec timeout de 3 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const url = `${this.config.serverUrl}/${this.config.versionFile}`;
      const response = await fetch(url, { 
        method: 'HEAD', // Utiliser HEAD pour ne récupérer que les headers
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const pingTime = Date.now() - startTime;
      const isReachable = response.ok;
      
      // Mettre à jour l'état
      this.state.serverReachable = isReachable;
      this.state.lastPing = {
        timestamp: new Date().toISOString(),
        success: isReachable,
        responseTime: pingTime
      };
      
      if (isReachable) {
        this.state.useFallback = false;
      } else {
        this.state.useFallback = true;
      }
      
      // Déclencher un événement pour mettre à jour l'UI
      window.dispatchEvent(new CustomEvent('serverstatus', { 
        detail: { 
          reachable: isReachable, 
          responseTime: pingTime 
        } 
      }));
      
      return isReachable;
      
    } catch (error) {
      const pingTime = Date.now() - startTime;
      
      this.state.serverReachable = false;
      this.state.useFallback = true;
      this.state.lastPing = {
        timestamp: new Date().toISOString(),
        success: false,
        error: error.name,
        responseTime: pingTime
      };
      
      // Déclencher un événement pour mettre à jour l'UI
      window.dispatchEvent(new CustomEvent('serverstatus', { 
        detail: { 
          reachable: false, 
          error: error.name 
        } 
      }));
      
      return false;
    }
  },

  /**
   * Démarrer le ping périodique du serveur
   */
  startPeriodicPing(intervalMs = 10000) {
    // Ping immédiat
    this.pingServer();
    
    // Puis toutes les X secondes
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      this.pingServer();
    }, intervalMs);
    
  },

  /**
   * Arrêter le ping périodique
   */
  stopPeriodicPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  },

  /**
   * Vérifier la version sur le serveur
   */
  async checkServerVersion() {
    const url = `${this.config.serverUrl}/${this.config.versionFile}`;
    const response = await fetch(url, { 
      method: 'GET',
      cache: 'no-cache',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return data.version;
  },

  /**
   * Obtenir la version locale
   */
  async getLocalVersion() {
    return await this.getMetadata('version');
  },

  /**
   * Télécharger et stocker les données
   */
  async downloadAndStore() {
    const url = `${this.config.serverUrl}/${this.config.dataFile}`;
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-cache',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    
    // Stocker dans IndexedDB
    await this.storeData(data);
    
    return data;
  },

  /**
   * Stocker les données dans IndexedDB
   */
  async storeData(data) {
    const db = this.state.db;

    const bulkWrite = (storeName, entries) => new Promise((resolve, reject) => {
      const tx    = db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      store.clear();
      for (const item of entries) store.put(item);
      tx.oncomplete = resolve;
      tx.onerror    = () => reject(tx.error);
    });

    await bulkWrite('zones', Object.values(data.zones));
    if (data.parcours) await bulkWrite('parcours', Object.values(data.parcours));
    if (data.profils)  await bulkWrite('profils',  Object.values(data.profils));
  },

  /**
   * Charger les données locales (fallback)
   */
  async loadLocalData() {
    try {
      const response = await fetch(this.config.localDataPath);
      if (!response.ok) throw new Error('Fichier local introuvable');
      
      const data = await response.json();
      await this.storeData(data);
      
      this.state.useFallback = true;
      
      return data;
    } catch (error) {
      console.error('❌ Impossible de charger les données locales:', error);
      throw error;
    }
  },

  /**
   * Récupérer une zone par son QR code
   */
  async getZone(qrCode) {
    return new Promise((resolve, reject) => {
      const transaction = this.state.db.transaction(['zones'], 'readonly');
      const store = transaction.objectStore('zones');
      const request = store.get(qrCode);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Récupérer toutes les zones
   */
  async getAllZones() {
    return new Promise((resolve, reject) => {
      const transaction = this.state.db.transaction(['zones'], 'readonly');
      const store = transaction.objectStore('zones');
      const request = store.getAll();

      request.onsuccess = () => {
        // Trier par ordre d'affichage
        const zones = request.result.sort((a, b) => a.ordre - b.ordre);
        resolve(zones);
      };
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Récupérer les zones actives uniquement
   */
  async getActiveZones() {
    const allZones = await this.getAllZones();
    return allZones.filter(zone => zone.actif);
  },

  /**
   * Rechercher des zones
   */
  async searchZones(query) {
    const allZones = await this.getAllZones();
    const lowerQuery = query.toLowerCase();
    
    return allZones.filter(zone => 
      zone.nom.toLowerCase().includes(lowerQuery) ||
      zone.description.toLowerCase().includes(lowerQuery) ||
      zone.batiment.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Récupérer un parcours
   */
  async getParcours(id) {
    return new Promise((resolve, reject) => {
      const transaction = this.state.db.transaction(['parcours'], 'readonly');
      const store = transaction.objectStore('parcours');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Récupérer tous les parcours
   */
  async getAllParcours() {
    return new Promise((resolve, reject) => {
      const transaction = this.state.db.transaction(['parcours'], 'readonly');
      const store = transaction.objectStore('parcours');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Récupérer tous les profils
   */
  async getAllProfils() {
    return new Promise((resolve, reject) => {
      const transaction = this.state.db.transaction(['profils'], 'readonly');
      const store = transaction.objectStore('profils');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Sauvegarder une métadonnée
   */
  async saveMetadata(key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.state.db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({ key, value, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Récupérer une métadonnée
   */
  async getMetadata(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.state.db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Gérer le changement de statut en ligne/hors-ligne
   */
  handleOnlineStatus(isOnline) {
    this.state.isOnline = isOnline;
    
    const event = new CustomEvent('connectionchange', { 
      detail: { isOnline } 
    });
    window.dispatchEvent(event);

    if (isOnline) {
      // Ping immédiat pour vérifier le serveur
      this.pingServer().then(reachable => {
        if (reachable) {
          this.syncData();
        }
      });
    } else {
      this.state.serverReachable = false;
      this.state.useFallback = true;
    }
  },

  /**
   * Forcer la synchronisation
   */
  async forceSync() {
    await this.syncData();
  },

  /**
   * Obtenir les statistiques
   */
  async getStats() {
    const zones = await this.getAllZones();
    const parcours = await this.getAllParcours();
    const profils = await this.getAllProfils();
    const version = await this.getLocalVersion();
    const lastSync = await this.getMetadata('lastSync');

    return {
      zones: zones.length,
      activeZones: zones.filter(z => z.actif).length,
      parcours: parcours.length,
      profils: profils.length,
      totalZones: zones.length,
      totalParcours: parcours.length,
      version,
      lastSync,
      isOnline: this.state.isOnline,
      serverReachable: this.state.serverReachable,
      lastPing: this.state.lastPing,
      useFallback: this.state.useFallback
    };
  },

  /**
   * Modifier l'URL du serveur à la volée (depuis l'interface admin)
   */
  setServerUrl(url) {
    // Supprimer le slash final
    this.config.serverUrl = url.replace(/\/$/, '');
    try {
      localStorage.setItem('lyceepad_server_url', this.config.serverUrl);
    } catch (e) {}
  },

  /**
   * Charger l'URL serveur depuis localStorage si présente
   */
  loadServerUrl() {
    try {
      const saved = localStorage.getItem('lyceepad_server_url');
      if (saved) {
        this.config.serverUrl = saved;
      }
    } catch (e) {}
  },

  /**
   * Créer une nouvelle zone (CRUD)
   */
  async createZone(zoneData) {
    return new Promise(async (resolve, reject) => {
      try {
        // Générer un ID unique si nécessaire
        if (!zoneData.id) {
          const allZones = await this.getAllZones();
          const maxId = Math.max(...allZones.map(z => z.id || 0), 0);
          zoneData.id = maxId + 1;
        }

        // Définir l'ordre si non fourni
        if (!zoneData.ordre) {
          const allZones = await this.getAllZones();
          zoneData.ordre = allZones.length + 1;
        }

        // Valeurs par défaut
        zoneData.actif = zoneData.statut === 'active';
        zoneData.date_creation = new Date().toISOString();

        const transaction = this.state.db.transaction(['zones'], 'readwrite');
        const store = transaction.objectStore('zones');
        const request = store.add(zoneData);

        request.onsuccess = () => {
          // Marquer comme modification locale non synchronisée
          this.saveMetadata('hasLocalChanges', true);
          resolve(zoneData);
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Mettre à jour une zone (CRUD)
   */
  async updateZone(zoneData) {
    return new Promise((resolve, reject) => {
      const transaction = this.state.db.transaction(['zones'], 'readwrite');
      const store = transaction.objectStore('zones');
      
      // Récupérer la zone existante
      const getRequest = store.get(zoneData.qr_code);
      
      getRequest.onsuccess = () => {
        const existingZone = getRequest.result;
        if (!existingZone) {
          reject(new Error('Zone introuvable'));
          return;
        }

        // Fusionner les données
        const updatedZone = {
          ...existingZone,
          ...zoneData,
          actif: zoneData.statut === 'active',
          date_modification: new Date().toISOString()
        };

        const putRequest = store.put(updatedZone);
        
        putRequest.onsuccess = () => {
          this.saveMetadata('hasLocalChanges', true);
          resolve(updatedZone);
        };
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  },

  /**
   * Supprimer une zone (CRUD)
   */
  async deleteZone(qrCode) {
    return new Promise((resolve, reject) => {
      const transaction = this.state.db.transaction(['zones'], 'readwrite');
      const store = transaction.objectStore('zones');
      const request = store.delete(qrCode);

      request.onsuccess = () => {
        this.saveMetadata('hasLocalChanges', true);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  },

  /**
   * Pousser les modifications locales vers le serveur
   */
  async pushToServer() {
    if (!this.state.isOnline || !this.state.serverReachable) {
      throw new Error('Serveur inaccessible - Impossible de pousser les modifications');
    }

    try {
      // Récupérer toutes les données locales
      const zones = await this.getAllZones();
      const parcours = await this.getAllParcours();
      const profils = await this.getAllProfils();

      // Construire le payload
      const payload = {
        zones: {},
        parcours: {},
        profils: {}
      };

      zones.forEach(zone => {
        payload.zones[zone.qr_code] = zone;
      });

      parcours.forEach(p => {
        payload.parcours[p.id] = p;
      });

      profils.forEach(p => {
        payload.profils[p.nom] = p;
      });

      // Envoyer au serveur via API
      const apiUrl = this.config.serverUrl.replace('/data', '/api/sync.php');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Marquer comme synchronisé
        await this.saveMetadata('hasLocalChanges', false);
        await this.saveMetadata('lastPush', new Date().toISOString());
        
        
        // Incrémenter la version
        const currentVersion = await this.getLocalVersion();
        const newVersion = this.incrementVersion(currentVersion);
        await this.saveMetadata('version', newVersion);
        
        return result;
      } else {
        throw new Error(result.message || 'Erreur serveur');
      }
    } catch (error) {
      console.error('❌ Erreur push serveur:', error);
      throw error;
    }
  },

  /**
   * Incrémenter la version (1.0.0 → 1.0.1)
   */
  incrementVersion(version) {
    if (!version) return '1.0.1';
    const parts = version.split('.');
    parts[2] = parseInt(parts[2]) + 1;
    return parts.join('.');
  },

  /**
   * Réinitialiser la base de données
   */
  async resetDatabase() {
    await this.clearDatabase();
  },

  /**
   * Vider la base de données
   */
  async clearDatabase() {
    const stores = ['zones', 'parcours', 'profils', 'metadata'];
    
    for (const storeName of stores) {
      const transaction = this.state.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
    
  }
};

// Initialiser automatiquement et exposer la Promise pour les autres scripts
window.DBManager = DBManager;
DBManager.ready = (document.readyState === 'loading')
  ? new Promise(resolve => document.addEventListener('DOMContentLoaded', () => resolve(DBManager.init())))
  : DBManager.init();
