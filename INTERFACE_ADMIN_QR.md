# Interface Admin + Génération QR Codes

**Date de création :** 4-5 Mars 2026  
**Version :** 1.0  
**Projet :** LycéePad - Application Cordova Android

---

## 🔐 Accès et Authentification

### URL d'accès
- **Page de connexion :** `http://localhost/lyceepad/html/login.html`
- **Interface admin :** `http://localhost/lyceepad/html/Admin.html`

### Identifiants par défaut
```
Utilisateur : admin
Mot de passe : admin
```

⚠️ **À modifier en production !**

### Fonctionnalités de sécurité
- ✅ Token stocké dans localStorage (`lyceepad_auth_token`)
- ✅ Expiration configurable :
  - **Par défaut :** 2 heures
  - **"Se souvenir de moi" :** 7 jours
- ✅ Redirection automatique si non authentifié
- ✅ Bouton déconnexion visible en haut à droite
- ✅ Protection de la page Admin.html

### Fichiers concernés
- `www/html/login.html` - Page de connexion
- `www/css/login.css` - Styles de connexion
- `www/js/login.js` - Logique d'authentification (AuthManager)

---

## 📋 Interface d'Administration

### Structure générale

L'interface admin dispose de **3 onglets principaux** :

#### 1. **Zones** 📍
Gestion complète des zones de l'établissement.

**Fonctionnalités :**
- Liste de toutes les zones (actuellement 30 zones)
- Barre de recherche en temps réel
- Bouton "Nouvelle Zone" (bleu, en haut)
- Affichage en cartes avec informations :
  - Nom de la zone
  - Code QR
  - Bâtiment
  - Étage
  - Coordonnées GPS
  - Badge statut (Active 🟢 / Inactive 🔴)

**Actions par zone :**
- 🟠 **Modifier** - Ouvrir le formulaire d'édition
- ⚪ **Contenus** - Gérer les contenus associés
- 🔴 **Supprimer** - Supprimer la zone (avec confirmation)

#### 2. **Contenus** 📁
Gestion des contenus multimédias associés aux zones.

**État :** Interface de base présente, à développer

#### 3. **Synchronisation** 🔄
Gestion de la synchronisation avec le serveur.

**Fonctionnalités :**
- 📊 État du serveur (192.168.15.38)
- 🔵 **Télécharger depuis serveur** - Récupérer les données distantes
- 🟢 **Pousser vers serveur** - Envoyer les modifications locales
- 🟠 **Réinitialiser local** - Vider IndexedDB
- 📝 Journal de synchronisation avec horodatage

---

## 🎨 Apparence et UX

### Navigation
- Navigation complète identique aux autres pages
- Logo LycéePad cliquable (retour accueil)
- Menu hamburger responsive
- Liens vers toutes les pages de l'app
- Onglet "Admin" actif (orange)

### Badges et indicateurs
- **Badge sync** en temps réel :
  - 🟢 **Online** - Serveur accessible
  - 🟠 **Local** - Mode hors ligne
  - 🔴 **Offline** - Pas de connexion
- Ping automatique toutes les 10 secondes

### Thèmes
- ☀️ **Mode clair** - Fond blanc, textes noirs
- 🌙 **Mode sombre** - Fond sombre, textes blancs
- Synchronisation avec app.js
- Bouton thème en haut à droite

### Boutons améliorés
- **Boutons avec gradients** pour meilleure visibilité
- **Ombres portées** pour effet de profondeur
- **Couleurs codées :**
  - 🔵 Bleu - Actions principales (Nouvelle Zone, Télécharger)
  - 🟢 Vert - Validation (Pousser, Enregistrer)
  - 🟠 Orange - Modification (Modifier, Réinitialiser)
  - 🔴 Rouge - Suppression (Supprimer, Déconnexion)
  - ⚪ Gris - Actions secondaires (Contenus, Annuler)

### Modal d'édition
- Fond sombre (85% opacité) pour masquer l'arrière-plan
- Fenêtre blanche centrée
- En-tête avec fond gris clair
- Formulaire sur fond blanc
- Tous les champs visibles en mode clair et sombre
- Bouton fermeture (X) en haut à droite

---

## 🔲 Système de Génération QR Codes

### Fonctionnement automatique

**Déclenchement :**
La génération de QR code se fait **automatiquement en temps réel** dès que vous tapez dans les champs :
- **Code QR** (ex: `QR_HALL_001`)
- **Nom de zone** (ex: `Hall d'accueil`)

**Emplacement :**
Le QR code apparaît **en bas du formulaire** dans une section dédiée avec :
- Icône QR code
- Titre "QR Code généré"
- Sous-titre "Scannez ce code pour accéder à la zone"
- Affichage du QR code (200x200px)
- 2 boutons d'action

### Données encodées

Format JSON encodé dans le QR code :
```json
{
  "code": "QR_HALL_001",
  "nom": "Hall d'accueil",
  "type": "lyceepad_zone"
}
```

**Champs :**
- `code` - Code unique de la zone
- `nom` - Nom descriptif de la zone
- `type` - Identifiant du type (toujours `lyceepad_zone`)

### Caractéristiques techniques

**Bibliothèque utilisée :** QRCode.js (davidshimjs)
- Fichier : `www/lib/qrcode.min.js`
- Aucune dépendance externe
- Génération côté client

**Paramètres :**
- **Taille :** 200x200 pixels
- **Format :** Canvas converti en PNG
- **Niveau de correction :** High (H) - 30% de récupération d'erreur
- **Couleurs :** Noir (#000000) sur blanc (#FFFFFF)

### Actions disponibles

#### 1. Télécharger PNG 🟢
**Fonction :** Télécharge le QR code en image PNG

**Comportement :**
- Convertit le canvas en image PNG
- Nom de fichier : `QR_[code].png` (ex: `QR_HALL_001.png`)
- Téléchargement direct dans le dossier Téléchargements
- Haute qualité, prêt à imprimer

**Code généré :**
```javascript
btnDownloadQR.addEventListener('click', downloadQRCode);
```

#### 2. Régénérer 🔄
**Fonction :** Régénère le QR code

**Utilité :**
- Si le code a changé manuellement
- Pour forcer un rafraîchissement
- En cas d'erreur d'affichage

**Code généré :**
```javascript
btnRegenerateQR.addEventListener('click', generateQRCode);
```

### Avantages du système

✅ **Pas d'outil externe** - Tout intégré dans l'interface  
✅ **Génération instantanée** - Temps réel dès la saisie  
✅ **QR codes prêts à imprimer** - Haute qualité 200x200px  
✅ **Cohérence garantie** - Données issues de la base  
✅ **Création immédiate** - Lors de l'ajout de nouvelles zones  
✅ **Pas de connexion requise** - Génération côté client  
✅ **Téléchargement simple** - Un clic pour sauvegarder  

---

## 📁 Fichiers du système

### Fichiers créés

| Fichier | Description | Lignes |
|---------|-------------|--------|
| `www/lib/qrcode.min.js` | Bibliothèque de génération QR code | Minifié |
| `www/html/login.html` | Page de connexion admin | 100 |
| `www/css/login.css` | Styles de la page de connexion | ~300 |
| `www/js/login.js` | Logique d'authentification | 153 |

### Fichiers modifiés

| Fichier | Modifications apportées | Lignes ajoutées |
|---------|------------------------|-----------------|
| `www/html/Admin.html` | Section QR generator dans modal | ~25 |
| `www/css/Admin.css` | Styles `.qr-generator`, boutons améliorés | ~70 |
| `www/js/Admin.js` | Fonctions `generateQRCode()`, `downloadQRCode()` | ~80 |
| `www/js/db-manager.js` | Fonctions CRUD (createZone, updateZone, deleteZone) | ~150 |

### Structure de l'admin

```
www/
├── html/
│   ├── Admin.html          # Interface principale admin
│   └── login.html          # Page de connexion
├── css/
│   ├── Admin.css           # Styles admin + QR generator
│   └── login.css           # Styles login
├── js/
│   ├── Admin.js            # Logique admin + génération QR
│   ├── login.js            # Authentification (AuthManager)
│   └── db-manager.js       # CRUD + synchronisation
└── lib/
    └── qrcode.min.js       # Bibliothèque QR codes
```

---

## 🎯 Workflow complet

### 1. Connexion
1. Ouvrir `http://localhost/lyceepad/html/login.html`
2. Entrer identifiants : `admin` / `admin`
3. (Optionnel) Cocher "Se souvenir de moi"
4. Cliquer "Connexion"
5. ✅ Redirection automatique vers `Admin.html`

### 2. Consultation des zones
1. Par défaut, onglet "Zones" actif
2. Liste de 30 zones chargée depuis IndexedDB
3. Utiliser la recherche pour filtrer
4. Cliquer sur une zone pour voir les détails

### 3. Création d'une nouvelle zone

**Étapes :**
1. Cliquer "Nouvelle Zone" (bouton bleu en haut)
2. Modal s'ouvre avec formulaire vide
3. **Remplir les champs** :
   - **Code QR*** (requis) - ex: `QR_CAFET_001`
   - **Nom de la zone*** (requis) - ex: `Cafétéria`
   - Bâtiment (optionnel) - ex: `Bâtiment A`
   - Étage (optionnel) - ex: `0`
   - Latitude (optionnel) - ex: `43.52764`
   - Longitude (optionnel) - ex: `5.44773`
   - Description courte (optionnel)
   - Zone active (checkbox, cochée par défaut)

4. **QR code généré automatiquement** dès la saisie du code et du nom
5. **Télécharger le QR** si besoin (bouton vert)
6. Cliquer "Enregistrer" (bouton bleu)
7. ✅ Zone sauvegardée dans IndexedDB
8. Modal se ferme, liste des zones mise à jour

### 4. Modification d'une zone existante

**Étapes :**
1. Cliquer sur "Modifier" (bouton orange) d'une zone
2. Modal s'ouvre avec formulaire pré-rempli
3. **Champs modifiables** :
   - ~~Code QR~~ (désactivé, non modifiable)
   - Nom, bâtiment, étage, GPS, description
   - Statut actif/inactif
4. QR code affiché (basé sur le code existant)
5. Modifier les champs souhaités
6. Cliquer "Enregistrer"
7. ✅ Zone mise à jour dans IndexedDB

### 5. Téléchargement du QR code

**Méthode 1 - Lors de la création :**
1. Remplir formulaire nouvelle zone
2. QR code apparaît en bas
3. Cliquer "Télécharger PNG"
4. ✅ Fichier `QR_CAFET_001.png` téléchargé

**Méthode 2 - Depuis une zone existante :**
1. Cliquer "Modifier" sur une zone
2. QR code affiché
3. Cliquer "Télécharger PNG"
4. ✅ QR code téléchargé

### 6. Suppression d'une zone

**Étapes :**
1. Cliquer sur "Supprimer" (bouton rouge) d'une zone
2. ⚠️ Pop-up de confirmation : "Supprimer la zone [nom] ? Cette action est irréversible."
3. Confirmer
4. ✅ Zone supprimée de IndexedDB
5. Liste mise à jour automatiquement

### 7. Synchronisation avec le serveur

**Option A - Télécharger depuis serveur :**
1. Aller dans l'onglet "Synchronisation"
2. Cliquer "Télécharger depuis serveur" (bouton bleu)
3. ✅ Données récupérées depuis `192.168.15.38/data/qr-data.json`
4. IndexedDB mis à jour
5. Log ajouté avec horodatage

**Option B - Pousser vers serveur :**
1. Aller dans l'onglet "Synchronisation"
2. Cliquer "Pousser vers serveur" (bouton vert)
3. ✅ Modifications envoyées à `192.168.15.38/api/sync.php`
4. MySQL mis à jour
5. JSON régénéré
6. Version incrémentée

**Option C - Réinitialiser local :**
1. Aller dans l'onglet "Synchronisation"
2. Cliquer "Réinitialiser local" (bouton orange)
3. ⚠️ Confirmation requise
4. ✅ IndexedDB vidé

### 8. Déconnexion
1. Cliquer bouton "Déconnexion" (rouge, en haut à droite)
2. Confirmation : "Voulez-vous vraiment vous déconnecter ?"
3. ✅ Token supprimé
4. Redirection vers `login.html`

---

## 🔧 Configuration technique

### Base de données

**IndexedDB (client) :**
- Nom : `LyceePadDB`
- Version : 1
- Store : `zones`
- Index : `qr_code` (unique)

**MySQL (serveur) :**
- Tables : `zones`, `contenus`, `profils`, `parcours`
- Serveur : `192.168.15.38`
- Accès via `sync.php`

### Synchronisation

**Ping serveur :**
- Intervalle : 10 secondes
- Timeout : 3 secondes
- URL : `192.168.15.38/data/db-version.json`

**Fallback :**
- Si serveur inaccessible → Données locales (IndexedDB)
- Si local vide → Fichiers JSON embarqués dans APK

### API de synchronisation

**Endpoint :** `192.168.15.38/api/sync.php`

**Méthodes :**
- `POST` - Envoyer modifications
- Format : JSON
- Actions : `create`, `update`, `delete`

**Réponses :**
```json
{
  "success": true,
  "message": "Zone créée avec succès",
  "version": "1.0.1"
}
```

---

## 📱 Déploiement sur tablette

### Fonctionnement hors ligne

**Au premier lancement :**
1. APK contient tous les fichiers (HTML, CSS, JS, images)
2. Fichiers JSON embarqués (`qr-data.json`, `db-version.json`)
3. Chargement instantané depuis le stockage local
4. Aucune connexion requise

**Synchronisation intelligente :**
- ✅ App démarre **instantanément** (fichiers locaux)
- 🔄 En arrière-plan : vérification serveur (si connexion WiFi au lycée)
- 📥 Si serveur accessible : téléchargement silencieux des mises à jour
- 💾 Stockage dans IndexedDB pour accès ultra-rapide

**Avantages :**
- ⚡ Démarrage < 0.5 seconde
- 📴 Fonctionne 100% hors ligne
- 🔄 Mise à jour automatique quand au lycée
- 💪 Pas de dépendance réseau

### Build de l'APK

**Commandes Cordova :**
```bash
# Build debug
cordova build android

# Build release signé
cordova build android --release

# Installation sur tablette
adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

**Fichier généré :**
- Debug : `platforms/android/app/build/outputs/apk/debug/app-debug.apk`
- Release : `platforms/android/app/build/outputs/apk/release/app-release.apk`

---

## 🐛 Problèmes résolus

### 1. Navigation privée bloquait localStorage
**Symptôme :** Impossible de se connecter, "roll back" sur la page de login

**Cause :** Navigation privée bloque localStorage

**Solution :**
- Détection de l'erreur localStorage
- Message d'erreur explicite
- Utilisation d'un onglet normal

### 2. Modal invisible en mode clair
**Symptôme :** Formulaire blanc sur fond blanc

**Cause :** Variables CSS incorrectes (`var(--card-bg)`)

**Solution :**
- Fond blanc forcé : `#FFFFFF`
- Mode sombre : `#1E293B`
- Bordure visible : `2px solid #e5e7eb`
- Textes forcés en noir/blanc selon le thème

### 3. Boutons peu visibles
**Symptôme :** Boutons bleus/orange/verts peu contrastés

**Cause :** Couleurs plates sans relief

**Solution :**
- Gradients sur tous les boutons
- Ombres portées (`box-shadow`)
- Texte "Supprimer" ajouté (au lieu d'icône seule)

### 4. Erreur CORS en développement
**Symptôme :** `file://` bloque les fichiers JSON

**Cause :** Sécurité du navigateur

**Solution :**
- Utilisation de WAMP localhost
- Copie des fichiers dans `C:\wamp64\www\lyceepad`
- Accès via `http://localhost/lyceepad`

### 5. Cache navigateur persistant
**Symptôme :** Modifications CSS/JS non visibles

**Cause :** Cache navigateur

**Solution :**
- Hard refresh : `Ctrl + Shift + R`
- Désactiver cache : F12 → Network → Disable cache
- Versioning des fichiers (à implémenter)

---

## 📈 Évolutions futures possibles

### Court terme
- [ ] Onglet "Contenus" - CRUD pour médias (images, vidéos, textes)
- [ ] Import/Export CSV de zones
- [ ] Personnalisation des couleurs du QR code
- [ ] Aperçu du QR code avant téléchargement
- [ ] QR code avec logo LycéePad au centre

### Moyen terme
- [ ] Statistiques de scan par zone
- [ ] Historique des modifications
- [ ] Multi-utilisateurs avec rôles (admin, éditeur, lecteur)
- [ ] Validation des coordonnées GPS
- [ ] Carte interactive pour placer les zones

### Long terme
- [ ] Application admin dédiée (Progressive Web App)
- [ ] API RESTful complète
- [ ] Dashboard analytics
- [ ] Notifications push
- [ ] Mode hors ligne avec file d'attente de sync

---

## 📞 Support et maintenance

### Fichiers de référence
- `INTERFACE_ADMIN_QR.md` - Cette documentation
- `README.md` - Documentation générale du projet
- `JOURNAL_MODIFICATIONS_*.md` - Historique des changements

### Contacts
- **Développeur :** [Votre nom]
- **Établissement :** Lycée Saint-Eloi
- **Date :** Mars 2026

### Logs et débogage

**Console navigateur (F12) :**
```javascript
// Vérifier l'authentification
DBManager.getAllZones().then(zones => console.log('Zones:', zones.length));

// Vérifier le statut sync
console.log('Sync badge:', document.getElementById('sync-status').textContent);

// Vérifier le token
console.log('Token:', localStorage.getItem('lyceepad_auth_token'));
```

---

**Version du document :** 1.0  
**Dernière mise à jour :** 5 Mars 2026  
**Statut :** ✅ Fonctionnel et testé sur localhost
