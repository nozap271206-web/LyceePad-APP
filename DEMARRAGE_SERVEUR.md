# Démarrage du Serveur API - Guide Rapide

## ✅ Configuration terminée !

L'IP **172.16.1.74** est maintenant configurée dans l'app Android et le serveur API est prêt.

---

## 🚀 ÉTAPES POUR DÉMARRER

### 1. Importer la base de données MySQL

Si ce n'est pas déjà fait :

```powershell
# Ouvrir MySQL (XAMPP/WAMP ou MySQL direct)
mysql -u root -p

# Dans MySQL, créer la base de données et importer
CREATE DATABASE IF NOT EXISTS lyceepad;
USE lyceepad;
SOURCE D:/Lycee/0-Tech/0-PROJET/BDD/lyceepad.sql;
exit;
```

**Ou via phpMyAdmin :**
1. Ouvrir http://localhost/phpmyadmin
2Créer une base `lyceepad`
3. Importer le fichier `D:\Lycee\0-Tech\0-PROJET\BDD\lyceepad.sql`

### 2. Vérifier la configuration

Ouvrez `.env` dans `RacinelyceePad` et vérifiez :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=        # Votre mot de passe MySQL (vide si pas de mdp)
DB_NAME=lyceepad
```

### 3. Démarrer le serveur API

```powershell
# Aller dans le dossier RacinelyceePad
cd D:\Lycee\0-Tech\0-PROJET\RacinelyceePad

# Démarrer le serveur API
npm run api
```

Vous devriez voir :
```
🚀 API LycéePad Mobile démarrée !
📍 URL réseau: http://172.16.1.74:3000
✅ Routes API disponibles
```

**⚠️ IMPORTANT : Laissez ce terminal ouvert pendant les tests !**

### 4. Tester l'API

Dans votre navigateur, allez sur :
```
http://localhost:3000/api/test
```

Vous devriez voir un JSON avec la liste des zones disponibles.

### 5. Recompiler l'app Android

```powershell
# Retour dans le dossier de l'app
cd D:\Lycee\0-Tech\0-PROJET\Android\LyceePad

# Recompiler
$env:ANDROID_HOME = "C:\Users\nozap\AppData\Local\Android\Sdk"
cordova build android
```

### 6. Installer et tester

1. Installez l'APK sur la tablette :
   ```
   platforms\android\app\build\outputs\apk\debug\app-debug.apk
   ```

2. **Assurez-vous que la tablette et le PC sont sur le même Wi-Fi !**

3. Lancez l'app → Scanner → Scannez un QR code

4. Les informations de la zone devraient s'afficher !

---

## 🧪 QR Codes de test

Utilisez les QR codes dans :
```
D:\Lycee\0-Tech\0-PROJET\Android\LyceePad\tmp_qr_examples\
```

Si les QR codes ne correspondent pas à votre base de données, créez-en de nouveaux avec les codes de votre table `zones`.

---

## 🔧 Dépannage

### ❌ "Erreur serveur (code 404)"
- La zone n'existe pas dans la base de données
- Vérifiez que la colonne `qr_code` de la table `zones` contient le bon code
- Vérifiez que `actif = 1` pour cette zone

### ❌ "Network request failed"
- Vérifiez que le serveur API tourne (npm run api)
- Vérifiez que PC et tablette sont sur le même réseau
- Testez depuis le navigateur de la tablette : `http://172.16.1.74:3000/api/test`
- Désactivez temporairement le pare-feu Windows

### ❌ "Base de données non accessible"
- MySQL est-il démarré ? (XAMPP/WAMP/MySQL)
- La base `lyceepad` existe-t-elle ?
- Les identifiants dans `.env` sont-ils corrects ?

### ❌ "Port 3000 déjà utilisé"
```powershell
# Arrêter le processus qui utilise le port 3000
netstat -ano | findstr :3000
# Noter le PID et l'arrêter :
taskkill /PID <numéro_pid> /F
```

---

## 📊 Structure de la table `zones`

Votre table `zones` doit avoir au minimum :
- `id_zone` (INT)
- `nom_zone` (VARCHAR)
- `qr_code` (VARCHAR) ← **Code QR scanné**
- `description` (TEXT)
- `actif` (TINYINT) ← **Doit être 1**
- `batiment` (VARCHAR)
- `etage` (VARCHAR)

---

## 🎯 Commandes récapitulatives

```powershell
# Terminal 1 : Serveur API
cd D:\Lycee\0-Tech\0-PROJET\RacinelyceePad
npm run api

# Terminal 2 : Compiler l'app (si besoin)
cd D:\Lycee\0-Tech\0-PROJET\Android\LyceePad
$env:ANDROID_HOME = "C:\Users\nozap\AppData\Local\Android\Sdk"
cordova build android
```

---

**Créé le 3 mars 2026** - Projet LycéePad BTS CIEL
