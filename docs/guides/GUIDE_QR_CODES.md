# 📱 Guide de Configuration des QR Codes - LycéePad

## 🎯 Ce que vous devez faire

Pour que les QR codes fonctionnent, vous devez :
1. **Trouver l'IP de votre PC** sur le réseau local
2. **Modifier 3 fichiers** avec cette IP
3. **Créer et démarrer un serveur backend** Node.js (API REST)
4. **Recompiler l'application** Android
5. **Tester avec les QR codes d'exemple**

---

## 📍 ÉTAPE 1 : Trouver l'IP de votre PC

### Windows (PowerShell) :
```powershell
ipconfig
```
Cherchez la ligne **"Adresse IPv4"** sous votre connexion active (Wi-Fi ou Ethernet).
Exemple : `192.168.1.45` ou `10.213.168.130`

### Alternative rapide :
```powershell
(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"}).IPAddress
```

**⚠️ IMPORTANT** : Le PC et la tablette doivent être sur le **même réseau Wi-Fi** !

---

## 📝 ÉTAPE 2 : Modifier les fichiers de configuration

Remplacez `10.213.168.130` par **votre IP** dans ces 3 fichiers :

### Fichier 1 : `config.xml` (ligne 14)
```xml
<access origin="http://VOTRE_IP:*" />
```

### Fichier 2 : `www/html/scanner.html` (ligne 24)
Dans la balise `<meta http-equiv="Content-Security-Policy"`, remplacez les 2 occurrences :
```html
http://VOTRE_IP:*
```

### Fichier 3 : `www/js/scanner.js` (ligne 8)
```javascript
const API_BASE_URL = "http://VOTRE_IP:3000";
```

**Exemple avec IP 192.168.1.100 :**
```javascript
const API_BASE_URL = "http://192.168.1.100:3000";
```

---

## 🖥️ ÉTAPE 3 : Créer le serveur backend

Le serveur backend **n'est pas inclus** dans ce projet. Vous devez le créer.

### Structure minimale du serveur :

Créez un dossier séparé (ex: `LyceePad-Backend`) et créez ces fichiers :

#### `package.json` :
```json
{
  "name": "lyceepad-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
```

#### `server.js` :
```javascript
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Base de données fictive (à remplacer par MySQL)
const zones = {
  "QR_CDI_001": {
    id: 1,
    nom: "Centre de Documentation et d'Information",
    description: "Le CDI est un espace de travail et de recherche documentaire.",
    batiment: "Bâtiment Principal",
    etage: "Rez-de-chaussée",
    qr_code: "QR_CDI_001",
    medias: [
      { type: "image", url: "https://via.placeholder.com/800x600?text=CDI" },
      { type: "video", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }
    ],
    horaires: "Lundi-Vendredi: 8h-17h"
  },
  "QR_CAFET_001": {
    id: 2,
    nom: "Cafétéria",
    description: "Espace de restauration pour les élèves et le personnel.",
    batiment: "Bâtiment Principal",
    etage: "Rez-de-chaussée",
    qr_code: "QR_CAFET_001",
    medias: [
      { type: "image", url: "https://via.placeholder.com/800x600?text=Cafeteria" }
    ],
    horaires: "Lundi-Vendredi: 8h-16h"
  },
  "QR_SUD_05": {
    id: 3,
    nom: "Atelier Électronique Sud 05",
    description: "Atelier pour les travaux pratiques en électronique.",
    batiment: "Bâtiment Sud",
    etage: "Rez-de-chaussée",
    qr_code: "QR_SUD_05",
    medias: [],
    horaires: "Selon planning des cours"
  },
  "QR_SUD_06": {
    id: 4,
    nom: "Salle Sud 06",
    description: "Salle de cours théorique.",
    batiment: "Bâtiment Sud",
    etage: "Rez-de-chaussée",
    qr_code: "QR_SUD_06",
    medias: [],
    horaires: "Selon planning des cours"
  },
  "QR_SUD_07": {
    id: 5,
    nom: "Salle Sud 07",
    description: "Salle de cours théorique.",
    batiment: "Bâtiment Sud",
    etage: "Rez-de-chaussée",
    qr_code: "QR_SUD_07",
    medias: [],
    horaires: "Selon planning des cours"
  },
  "QR_SUD_08": {
    id: 6,
    nom: "Salle Sud 08",
    description: "Salle de cours théorique.",
    batiment: "Bâtiment Sud",
    etage: "Rez-de-chaussée",
    qr_code: "QR_SUD_08",
    medias: [],
    horaires: "Selon planning des cours"
  },
  "QR_SUD_09": {
    id: 7,
    nom: "Salle Sud 09",
    description: "Salle de cours théorique.",
    batiment: "Bâtiment Sud",
    etage: "Rez-de-chaussée",
    qr_code: "QR_SUD_09",
    medias: [],
    horaires: "Selon planning des cours"
  },
  "QR_LABO_SUD": {
    id: 8,
    nom: "Laboratoire Sud",
    description: "Laboratoire pour les expériences en sciences.",
    batiment: "Bâtiment Sud",
    etage: "1er étage",
    qr_code: "QR_LABO_SUD",
    medias: [],
    horaires: "Selon planning des cours"
  },
  "QR_FB_10": {
    id: 9,
    nom: "Foyer Bâtiment 10",
    description: "Espace de détente pour les élèves.",
    batiment: "Bâtiment 10",
    etage: "Rez-de-chaussée",
    qr_code: "QR_FB_10",
    medias: [],
    horaires: "8h-18h"
  }
};

// ===== ROUTE PRINCIPALE : Récupérer une zone par QR Code =====
app.get('/api/zone/:code', (req, res) => {
  const qrCode = req.params.code;
  console.log(`[API] Recherche zone avec QR Code: ${qrCode}`);
  
  const zone = zones[qrCode];
  
  if (zone) {
    console.log(`[API] ✅ Zone trouvée: ${zone.nom}`);
    res.json(zone);
  } else {
    console.log(`[API] ❌ Zone non trouvée pour: ${qrCode}`);
    res.status(404).json({ error: 'Zone non trouvée' });
  }
});

// ===== ROUTE DE TEST =====
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API LycéePad fonctionne !',
    timestamp: new Date().toISOString(),
    zones_disponibles: Object.keys(zones)
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Serveur API LycéePad démarré !`);
  console.log(`📍 URL locale: http://localhost:${PORT}`);
  console.log(`📍 URL réseau: http://VOTRE_IP:${PORT}`);
  console.log(`\n✅ Routes disponibles:`);
  console.log(`   - GET /api/test`);
  console.log(`   - GET /api/zone/:code`);
  console.log(`\n🔍 Zones QR disponibles:`, Object.keys(zones).join(', '));
  console.log(`\n📱 N'oubliez pas de modifier l'IP dans l'app mobile !\n`);
});
```

---

## 🚀 ÉTAPE 4 : Démarrer le serveur

Dans le dossier du serveur :

```powershell
# Installer les dépendances (première fois seulement)
npm install

# Démarrer le serveur
npm start
```

Vous devriez voir :
```
🚀 Serveur API LycéePad démarré !
📍 URL locale: http://localhost:3000
📍 URL réseau: http://VOTRE_IP:3000
```

**⚠️ Laissez ce terminal ouvert** pendant que vous testez l'app !

### Tester le serveur :

Ouvrez votre navigateur et allez sur :
```
http://localhost:3000/api/test
```

Vous devriez voir un JSON avec le message de succès.

---

## 📲 ÉTAPE 5 : Recompiler l'application

Après avoir modifié les fichiers avec votre IP :

```powershell
cd D:\Lycee\0-Tech\0-PROJET\Android\LyceePad
$env:ANDROID_HOME = "C:\Users\nozap\AppData\Local\Android\Sdk"
cordova build android
```

Installez le nouvel APK sur votre tablette :
```
platforms\android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 🧪 ÉTAPE 6 : Tester avec les QR codes

Les QR codes d'exemple sont dans : `tmp_qr_examples/`

1. **Imprimez** ou **affichez** un QR code (ex: `QR_CDI_001.png`)
2. Lancez l'app sur la tablette
3. Allez dans **Scanner**
4. Scannez le QR code
5. Les infos de la zone devraient s'afficher !

---

## 🔧 Dépannage

### ❌ "Impossible d'accéder à la caméra"
- Vérifiez les permissions de l'app dans les paramètres Android
- Réinstallez l'app

### ❌ "Erreur serveur (code 404)"
- Le QR code scanné n'existe pas dans la base de données
- Vérifiez que le serveur est démarré
- Vérifiez les logs du serveur

### ❌ "Network request failed" ou timeout
- Vérifiez que le PC et la tablette sont sur le **même réseau Wi-Fi**
- Vérifiez que l'IP dans les fichiers est correcte
- Testez l'accès au serveur depuis le navigateur de la tablette : `http://VOTRE_IP:3000/api/test`
- Désactivez le pare-feu Windows temporairement pour tester

### ❌ Le serveur ne démarre pas
```powershell
# Vérifier si le port 3000 est déjà utilisé
netstat -ano | findstr :3000

# Si occupé, changer le port dans server.js ET dans scanner.js
```

---

## 📊 Architecture complète

```
┌─────────────────┐
│   Tablette      │
│   (LycéePad)    │
│                 │
│  1. Scanner QR  │──┐
│  2. Envoie code │  │
└─────────────────┘  │
                     │  HTTP Request
                     │  GET /api/zone/QR_CDI_001
                     ▼
              ┌─────────────────┐
              │   PC (Serveur)  │
              │   Node.js:3000  │
              │                 │
              │  3. Cherche     │
              │     dans BDD    │
              │  4. Retourne    │
              │     JSON        │
              └─────────────────┘
                     │
                     │  HTTP Response
                     │  { nom: "CDI", ... }
                     ▼
              ┌─────────────────┐
              │   Tablette      │
              │  5. Affiche     │
              │     les infos   │
              └─────────────────┘
```

---

## 📝 Checklist finale

- [ ] IP du PC trouvée
- [ ] Fichiers modifiés (config.xml, scanner.html, scanner.js)
- [ ] Serveur backend créé
- [ ] Dépendances installées (`npm install`)
- [ ] Serveur démarré (`npm start`)
- [ ] Serveur accessible sur le réseau (test depuis navigateur)
- [ ] Application recompilée
- [ ] APK installé sur tablette
- [ ] QR codes imprimés/affichés
- [ ] Test de scan réussi !

---

**Créé le 3 mars 2026** - Projet LycéePad BTS CIEL
