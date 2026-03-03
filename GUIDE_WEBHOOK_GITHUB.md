# 🔄 Guide Déploiement Automatique GitHub → Serveur

## 📖 Vue d'Ensemble

Le système de déploiement automatique permet de mettre à jour automatiquement votre serveur web à chaque `git push` sur GitHub.

**Flux de travail :**
```
1. Vous : git push origin main
2. GitHub → envoie notification → webhook.php (sur votre serveur)
3. webhook.php → vérifie sécurité → exécute deploy.sh
4. deploy.sh → git pull → met à jour le serveur
```

---

## 📁 Fichiers Existants dans `deployment/`

Vous avez déjà ces fichiers dans votre projet :

1. **`webhook.php`** - Reçoit les notifications de GitHub
2. **`deploy.sh`** - Script de déploiement pour Linux/Unix
3. **`deploy.ps1`** - Script de déploiement pour Windows
4. **`README.md`** - Guide complet de configuration
5. **`CONFIGURATION.md`** - Détails techniques

---

## 🚀 Configuration Étape par Étape

### Étape 1 : Préparer le Serveur

#### A) Identifier votre serveur web

Votre serveur du lycée doit avoir un dossier web accessible. Exemples :

**Linux/Apache :**
```bash
/var/www/html/
```

**Windows/IIS :**
```
C:\inetpub\wwwroot\
```

**Vérifiez avec votre administrateur réseau !**

#### B) Cloner le projet sur le serveur

**📍 Sur le serveur du lycée** (via SSH ou accès distant) :

```bash
# Linux/Unix
cd /var/www/html
git clone https://github.com/nozap271206-web/LyceePad-APP.git LyceePad
cd LyceePad
```

```powershell
# Windows
cd C:\inetpub\wwwroot
git clone https://github.com/nozap271206-web/LyceePad-APP.git LyceePad
cd LyceePad
```

---

### Étape 2 : Configurer webhook.php

#### A) Générer un token secret

Sur votre PC :
```powershell
# Générer un token aléatoire sécurisé
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Exemple de résultat : `aB3xK9mP2qR8tY5jL4nW7vC1dF6gH0sZ`

**⚠️ Notez ce token ! Vous en aurez besoin dans GitHub.**

#### B) Modifier webhook.php

Éditez le fichier `deployment/webhook.php` sur votre serveur :

```php
// LIGNE 9 - Remplacez par votre token
define('SECRET_TOKEN', 'aB3xK9mP2qR8tY5jL4nW7vC1dF6gH0sZ');

// LIGNE 10 - Vérifiez le chemin
define('DEPLOY_SCRIPT', __DIR__ . '/deploy.sh'); // Linux
// OU
define('DEPLOY_SCRIPT', __DIR__ . '/deploy.ps1'); // Windows
```

---

### Étape 3 : Configurer le Script de Déploiement

#### Linux/Unix : deploy.sh

Éditez `deployment/deploy.sh` :

```bash
# LIGNE 8 - Chemin du projet sur VOTRE serveur
PROJECT_DIR="/var/www/html/LyceePad"
```

Rendre exécutable :
```bash
chmod +x deployment/deploy.sh
chmod +x deployment/webhook.php
```

#### Windows : deploy.ps1

Éditez `deployment/deploy.ps1` :

```powershell
# Chemin du projet sur VOTRE serveur
$ProjectDir = "C:\inetpub\wwwroot\LyceePad"
```

Autoriser exécution :
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Étape 4 : Rendre webhook.php Accessible par Web

Le webhook doit être accessible via une URL publique.

#### A) Créer un alias/lien web

**Apache (.htaccess)** :
Créez un fichier `.htaccess` dans `deployment/` :
```apache
# Autoriser l'accès au webhook
<Files "webhook.php">
    Require all granted
</Files>
```

**Nginx** :
Ajoutez dans votre configuration :
```nginx
location /deployment/webhook.php {
    allow all;
}
```

#### B) URL du webhook

Votre webhook sera accessible via :
```
http://votre-serveur-lycee.fr/LyceePad/deployment/webhook.php
```

Exemple :
```
http://172.16.1.74/LyceePad/deployment/webhook.php
```

**⚠️ Testez cette URL dans un navigateur !**
Vous devriez voir : `Method Not Allowed` (c'est normal, c'est une requête POST uniquement)

---

### Étape 5 : Configurer GitHub Webhook

#### A) Aller dans les paramètres GitHub

1. Ouvrez : https://github.com/nozap271206-web/LyceePad-APP
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu gauche : **Webhooks**
4. Cliquez sur **Add webhook** (Ajouter un webhook)

#### B) Configuration du webhook

Remplissez le formulaire :

| Champ | Valeur |
|-------|--------|
| **Payload URL** | `http://votre-serveur-lycee.fr/LyceePad/deployment/webhook.php` |
| **Content type** | `application/json` |
| **Secret** | Votre token généré (ex: `aB3xK9mP2qR8tY5jL4nW7vC1dF6gH0sZ`) |
| **Which events?** | Sélectionnez "Just the push event" |
| **Active** | ✅ Coché |

Cliquez sur **Add webhook**

---

### Étape 6 : Tester le Déploiement

#### A) Premier test

Faites une petite modification dans votre projet :

```powershell
# Sur votre PC
cd D:\Lycee\0-Tech\0-PROJET\Android\LyceePad
echo "# Test webhook" >> README.md
git add README.md
git commit -m "test: Vérification webhook"
git push origin main
```

#### B) Vérifier dans GitHub

1. Retournez dans **Settings → Webhooks**
2. Cliquez sur votre webhook
3. Onglet **Recent Deliveries**
4. Vous devez voir une requête avec un ✅ vert

#### C) Vérifier sur le serveur

Connectez-vous au serveur et vérifiez :

```bash
# Voir les logs du webhook
cat deployment/webhook.log

# Voir les logs de déploiement
cat deployment/deploy.log

# Vérifier le dernier commit
git log -1
```

Vous devez voir votre commit "test: Vérification webhook" !

---

## 📊 Logs et Débogage

### Fichiers de logs

Sur le serveur :
```
deployment/webhook.log  → Logs des requêtes GitHub
deployment/deploy.log   → Logs des déploiements
```

### Commandes de diagnostic

```bash
# Voir les dernières lignes des logs
tail -f deployment/webhook.log
tail -f deployment/deploy.log

# Tester manuellement le script de déploiement
cd deployment
./deploy.sh  # Linux
# OU
powershell -File deploy.ps1  # Windows
```

---

## 🔒 Sécurité

### ✅ Ce qui est sécurisé

- ✅ Token secret partagé entre GitHub et serveur
- ✅ Vérification de signature HMAC SHA-256
- ✅ Seuls les push sur `main` déclenchent le déploiement
- ✅ Logs de toutes les tentatives

### ⚠️ Recommandations

1. **Ne jamais commiter le token** dans Git !
2. **Utiliser HTTPS** si possible (certificat SSL)
3. **Limiter les permissions** du serveur web
4. **Surveiller les logs** régulièrement

---

## 🎯 Cas d'Usage Typique

### Workflow Quotidien

**Sur votre PC de développement :**

1. Modifier le code
   ```powershell
   # Exemple : corriger un bug
   code www/js/scanner.js
   ```

2. Tester localement
   ```powershell
   cordova build android
   # Installer et tester sur tablette
   ```

3. Pusher sur GitHub
   ```powershell
   git add .
   git commit -m "fix: Correction bug scanner QR"
   git push origin main
   ```

4. **🎉 Le serveur se met à jour automatiquement !**
   - GitHub envoie notification → webhook.php
   - webhook.php → exécute deploy.sh
   - deploy.sh → git pull + mise à jour

**Vous n'avez plus rien à faire sur le serveur !**

---

## 🆘 Dépannage

### Le webhook ne se déclenche pas

**Vérifiez :**
1. URL du webhook accessible (testez dans navigateur)
2. Token secret identique dans `webhook.php` ET GitHub
3. Webhook actif dans GitHub (Settings → Webhooks)
4. Fichiers PHP exécutables sur le serveur

**Commande de test** (depuis le serveur) :
```bash
curl -X POST http://localhost/LyceePad/deployment/webhook.php
```

### Le déploiement échoue

**Vérifiez :**
1. Permissions d'exécution sur `deploy.sh` ou `deploy.ps1`
2. Chemin `PROJECT_DIR` correct dans le script
3. Git installé sur le serveur
4. Permissions du serveur web (www-data, IIS_IUSRS, etc.)

**Commande de test** :
```bash
# Exécuter le script manuellement
cd deployment
bash deploy.sh  # Linux
```

### Logs vides

**Si `webhook.log` est vide :**
1. Vérifier permissions d'écriture
   ```bash
   chmod 666 deployment/webhook.log
   chmod 666 deployment/deploy.log
   ```

2. Vérifier erreurs PHP
   ```bash
   tail -f /var/log/apache2/error.log  # Linux/Apache
   ```

---

## 📚 Fichiers de Référence

Tous les fichiers sont déjà dans votre projet :

- `deployment/webhook.php` - Récepteur GitHub
- `deployment/deploy.sh` - Script Linux/Unix
- `deployment/deploy.ps1` - Script Windows
- `deployment/README.md` - Guide complet (214 lignes)
- `deployment/CONFIGURATION.md` - Documentation technique

**Lisez `deployment/README.md` pour plus de détails !**

---

## 🎓 Exemple pour le Lycée Saint-Éloi

Supposons que votre serveur soit à `http://172.16.1.74` :

### Configuration webhook.php
```php
define('SECRET_TOKEN', 'LyceeStEloi2026SecureToken123');
define('DEPLOY_SCRIPT', '/var/www/html/LyceePad/deployment/deploy.sh');
```

### Configuration deploy.sh
```bash
PROJECT_DIR="/var/www/html/LyceePad"
```

### GitHub Webhook URL
```
http://172.16.1.74/LyceePad/deployment/webhook.php
```

### Test
```bash
# Sur le serveur
cd /var/www/html/LyceePad
git log -1  # Doit afficher le dernier commit après chaque push
```

---

## ✨ Résultat Final

Après configuration, à chaque fois que vous faites :

```powershell
git push origin main
```

**Automatiquement :**
1. ✅ GitHub envoie notification
2. ✅ Serveur reçoit et vérifie
3. ✅ Code mis à jour sur le serveur
4. ✅ Dépendances installées (npm)
5. ✅ Logs créés
6. ✅ Serveur à jour en quelques secondes

**Plus besoin de FTP, SSH ou mise à jour manuelle !** 🎉

---

**Date :** 3 mars 2026  
**Projet :** LycéePad - Lycée Saint-Éloi  
**Dépôt :** https://github.com/nozap271206-web/LyceePad-APP


# Journal des modifications - 3 mars 2026

## 📱 Application LycéePad - Modifications effectuées

---

## 1. Configuration Splash Screen (Android 12+)

**Fichier modifié :** `config.xml`

### Changements :
- Migration vers la nouvelle API Android 12+ : `AndroidWindowSplashScreenAnimatedIcon`
- Remplacement des anciennes balises `<splash>` dépréciées
- Configuration :
  ```xml
  <preference name="AndroidWindowSplashScreenAnimatedIcon" value="www/img/logo.png" />
  <preference name="AndroidWindowSplashScreenBackground" value="#3b82f6" />
  <preference name="AndroidWindowSplashScreenIconBackgroundColor" value="#3b82f6" />
  <preference name="SplashScreenDelay" value="3000" />
  ```

**Résultat :** Splash screen natif conforme aux standards Android 12+

---

## 2. Correction Layout Tablette

**Fichier modifié :** `www/css/Home.css`

### Problème :
Les cartes de la page d'accueil se chevauchaient sur tablette (1024px x 1366px)

### Solution :
```css
@media (max-width: 1024px) {
  .visual-3d {
    display: flex;
    flex-direction: column; /* Passage en vertical */
    gap: 1.5rem; /* Espacement de 1.5rem */
  }
  
  .float-card-3d {
    width: 100% !important;
    max-width: 600px;
    margin: 0 auto;
  }
}
```

**Résultat :** Cartes verticales sans chevauchement, centrées avec espacement adéquat

---

## 3. Configuration Serveur API Backend

**Fichiers créés :**
- `D:\Lycee\0-Tech\0-PROJET\RacinelyceePad\api-server.js`
- `D:\Lycee\0-Tech\0-PROJET\RacinelyceePad\config\database.js`
- `D:\Lycee\0-Tech\0-PROJET\RacinelyceePad\.env`

### Routes API :
```javascript
GET /api/test           → Test de l'API et connexion BDD
GET /api/zones          → Liste toutes les zones actives
GET /api/zone/:code     → Récupération d'une zone par QR code
```

### Base de données :
- **Host :** localhost
- **Database :** lyceepad
- **Table :** zones (30 entrées actives)
- **Colonnes :** id, nom, description, batiment, etage, qr_code, horaires, actif

### Exemples de QR codes :
- QR_HALL_001 → Hall d'accueil
- QR_CDI_001 → Centre de Documentation
- QR_CAFET_001 → Cafétéria
- QR_SUD_05 à QR_SUD_09 → Salles Sud
- QR_LABO_SUD, QR_FB_10

**Résultat :** Serveur Node.js + Express opérationnel sur port 3000

---

## 4. Mise à jour Configuration IP

### Première IP : 172.16.1.74
**Fichiers modifiés :**
- `config.xml` → `<access origin="http://172.16.1.74:*" />`
- `www/html/scanner.html` → Content-Security-Policy
- `www/js/scanner.js` → `API_BASE_URL = "http://172.16.1.74:3000"`

### Changement de réseau → Nouvelle IP : 10.48.102.130
**Fichiers mis à jour :**
- `config.xml` → `<access origin="http://10.48.102.130:*" />`
- `www/html/scanner.html` → `img-src` et `connect-src` vers 10.48.102.130
- `www/js/scanner.js` → `API_BASE_URL = "http://10.48.102.130:3000"`

**Résultat :** Application configurée pour le nouveau réseau

---

## 5. Compilations APK

### Première compilation (IP 172.16.1.74)
```powershell
cordova build android
```
**Output :** `platforms\android\app\build\outputs\apk\debug\app-debug.apk`

### Deuxième compilation (IP 10.48.102.130)
```powershell
cordova build android
```
**Output :** `platforms\android\app\build\outputs\apk\debug\app-debug.apk` (mis à jour)

**Résultat :** APK prêt pour installation sur tablette

---

## 6. Documentation Créée

**Fichiers de guides :**
- `deployment/README.md` → Guide complet QR codes
- `deployment/CONFIGURATION.md` → Configuration serveur web
- `RacinelyceePad/GUIDE_INSTALLATION.md` → Installation serveur API
- `RacinelyceePad/DEMARRAGE_SERVEUR.md` → Lancement serveur

**Contenu clé :**
- Installation Node.js et MySQL
- Configuration base de données
- Commandes de démarrage
- Tests de connectivité
- Génération de QR codes

---

## 7. Tests et Validations

### Tests Serveur API :
```bash
✅ GET http://10.48.102.130:3000/api/test
Response: {"status":"OK","database":"Connectée","zones_disponibles":30}

✅ GET http://10.48.102.130:3000/api/zone/QR_CDI_001
Response: {"id":2,"nom":"CDI","description":"Centre de Documentation et d'Information"...}
```

### Tests Base de données :
```sql
✅ SELECT COUNT(*) FROM zones WHERE actif = 1
Result: 30 zones

✅ Connexion MySQL établie
✅ Pool de connexions opérationnel
```

---

## État Final du Projet

### Configuration Actuelle :
- **IP Serveur :** 10.48.102.130
- **Port API :** 3000
- **Base de données :** MySQL (lyceepad)
- **Zones actives :** 30
- **APK :** Compilé et prêt

### Fichiers Application Modifiés :
1. ✅ `config.xml` (splash + IP + permissions)
2. ✅ `www/css/Home.css` (layout tablette)
3. ✅ `www/html/scanner.html` (Content-Security-Policy)
4. ✅ `www/js/scanner.js` (API_BASE_URL)

### Fichiers Serveur Créés :
1. ✅ `RacinelyceePad/api-server.js`
2. ✅ `RacinelyceePad/config/database.js`
3. ✅ `RacinelyceePad/.env`
4. ✅ Guides d'installation multiples

---

## Pour Installation sur Tablette

### Prérequis :
1. Tablette et PC sur le même réseau Wi-Fi
2. Serveur API en cours d'exécution (port 3000)

### Étapes :
1. **Tester connectivité :**
   - Ouvrir navigateur tablette
   - Aller sur : `http://10.48.102.130:3000/api/test`
   - Vérifier réponse JSON : `"status":"OK"`

2. **Installer APK :**
   - Via câble USB : `adb install -r platforms\android\app\build\outputs\apk\debug\app-debug.apk`
   - Ou copier manuellement l'APK sur la tablette

3. **Scanner QR codes :**
   - Imprimer/afficher QR codes depuis `tmp_qr_examples/`
   - Scanner avec l'application
   - Vérifier affichage des informations de zone

---

## Commandes Utiles

### Démarrer le serveur :
```powershell
cd D:\Lycee\0-Tech\0-PROJET\RacinelyceePad
node api-server.js
```

### Vérifier serveur actif :
```powershell
netstat -ano | Select-String ":3000"
```

### Recompiler l'application :
```powershell
cd D:\Lycee\0-Tech\0-PROJET\Android\LyceePad
$env:ANDROID_HOME = "C:\Users\nozap\AppData\Local\Android\Sdk"
cordova build android
```

### Tester API :
```powershell
Invoke-WebRequest -Uri "http://10.48.102.130:3000/api/test" -UseBasicParsing
```

---

## Notes Importantes

⚠️ **Ne pas fermer le terminal PowerShell** où le serveur Node.js est lancé !

⚠️ **Vérifier l'IP actuelle** à chaque changement de réseau avec `ipconfig`

⚠️ **Mettre à jour les 3 fichiers** si changement d'IP :
- config.xml
- www/html/scanner.html  
- www/js/scanner.js

---

**Date de création :** 3 mars 2026  
**Version Application :** 1.0.0  
**Cordova Android :** 14.0.1  
**Node.js :** Actif  
**MySQL :** Actif
