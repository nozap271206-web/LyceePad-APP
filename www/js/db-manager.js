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
    console.log('🚀 Initialisation du DB Manager...');
    
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
      
      console.log('✅ DB Manager initialisé');
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
      console.log('⚠️ Mode hors-ligne - Utilisation des données locales');
      await this.loadLocalData();
      return;
    }

    try {
      // Vérifier la version sur le serveur
      const serverVersion = await this.checkServerVersion();
      const localVersion = await this.getLocalVersion();

      console.log('📊 Versions:', { server: serverVersion, local: localVersion });

      // Télécharger si nouvelle version ou pas de données locales
      if (!localVersion || serverVersion !== localVersion) {
        console.log('⬇️ Téléchargement des nouvelles données...');
        await this.downloadAndStore();
        await this.saveMetadata('version', serverVersion);
        await this.saveMetadata('lastSync', new Date().toISOString());
        console.log('✅ Données synchronisées');
        
        // Déclencher un événement personnalisé
        window.dispatchEvent(new CustomEvent('datasynced', { 
          detail: { version: serverVersion } 
        }));
      } else {
        console.log('✅ Données à jour');
      }

    } catch (error) {
      console.error('❌ Erreur de synchronisation:', error);
      console.log('🔄 Fallback sur données locales');
      await this.loadLocalData();
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
        console.log(`✅ Serveur accessible (${pingTime}ms)`);
        this.state.useFallback = false;
      } else {
        console.log(`⚠️ Serveur répond mais erreur HTTP ${response.status}`);
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
      
      console.log(`❌ Serveur inaccessible (${error.name})`);
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
    
    console.log(`🔄 Ping périodique démarré (toutes les ${intervalMs/1000}s)`);
  },

  /**
   * Arrêter le ping périodique
   */
  stopPeriodicPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
      console.log('⏸️ Ping périodique arrêté');
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
    
    // Transaction pour les zones
    const txZones = db.transaction(['zones'], 'readwrite');
    const storeZones = txZones.objectStore('zones');
    
    // Vider et remplir
    await storeZones.clear();
    
    for (const [qrCode, zone] of Object.entries(data.zones)) {
      await storeZones.put(zone);
    }

    await txZones.complete;

    // Stocker les parcours
    if (data.parcours) {
      const txParcours = db.transaction(['parcours'], 'readwrite');
      const storeParcours = txParcours.objectStore('parcours');
      await storeParcours.clear();
      
      for (const [id, parcours] of Object.entries(data.parcours)) {
        await storeParcours.put(parcours);
      }
    }

    // Stocker les profils
    if (data.profils) {
      const txProfils = db.transaction(['profils'], 'readwrite');
      const storeProfils = txProfils.objectStore('profils');
      await storeProfils.clear();
      
      for (const [nom, profil] of Object.entries(data.profils)) {
        await storeProfils.put(profil);
      }
    }

    console.log('💾 Données stockées dans IndexedDB');
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
      console.log('📁 Données locales chargées');
      
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
      console.log('🌐 Connexion rétablie - Vérification serveur...');
      // Ping immédiat pour vérifier le serveur
      this.pingServer().then(reachable => {
        if (reachable) {
          this.syncData();
        }
      });
    } else {
      console.log('📵 Mode hors-ligne activé');
      this.state.serverReachable = false;
      this.state.useFallback = true;
    }
  },

  /**
   * Forcer la synchronisation
   */
  async forceSync() {
    console.log('🔄 Synchronisation forcée...');
    await this.syncData();
  },

  /**
   * Obtenir les statistiques
   */
  async getStats() {
    const zones = await this.getAllZones();
    const parcours = await this.getAllParcours();
    const version = await this.getLocalVersion();
    const lastSync = await this.getMetadata('lastSync');

    return {
      totalZones: zones.length,
      activeZones: zones.filter(z => z.actif).length,
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
   * Vider la base de données
   */
  async clearDatabase() {
    const stores = ['zones', 'parcours', 'profils', 'metadata'];
    
    for (const storeName of stores) {
      const transaction = this.state.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
    
    console.log('🗑️ Base de données vidée');
  }
};

// Initialiser automatiquement au chargement
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DBManager.init());
} else {
  DBManager.init();
}

// Export pour utilisation globale
window.DBManager = DBManager;
