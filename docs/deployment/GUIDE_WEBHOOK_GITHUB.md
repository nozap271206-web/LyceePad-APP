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


