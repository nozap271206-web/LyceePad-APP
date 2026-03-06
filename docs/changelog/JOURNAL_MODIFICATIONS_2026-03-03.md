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
