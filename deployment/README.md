# 🚀 Guide de Configuration du Webhook GitHub - LyceePad

Ce guide vous permet de configurer un déploiement automatique de votre application LyceePad sur le serveur du lycée à chaque push sur GitHub.

## 📋 Prérequis

### Sur le serveur du lycée :
- ✅ Serveur web (Apache/Nginx) avec PHP 7.4+
- ✅ Git installé
- ✅ Accès SSH ou FTP au serveur
- ✅ Droits d'exécution pour les scripts

### Sur GitHub :
- ✅ Dépôt : https://github.com/nozap271206-web/LyceePad-APP
- ✅ Droits d'administration sur le dépôt

---

## 📁 Installation sur le Serveur

### Étape 1 : Cloner le projet sur le serveur

Connectez-vous en SSH à votre serveur et exécutez :

```bash
# Exemple pour Linux/Unix
cd /var/www/html
git clone https://github.com/nozap271206-web/LyceePad-APP.git LyceePad
cd LyceePad
```

> **Windows** : Remplacez `/var/www/html` par `C:\inetpub\wwwroot\`

### Étape 2 : Créer le dossier de déploiement accessible via web

```bash
# Dans le dossier du projet
mkdir deployment
```

### Étape 3 : Copier les fichiers de déploiement

Uploadez les fichiers suivants dans le dossier `deployment/` sur votre serveur :
- `webhook.php`
- `deploy.sh` (Linux/Unix) OU `deploy.ps1` (Windows)

### Étape 4 : Configuration du script

#### **A) Configurer webhook.php**

Ouvrez `webhook.php` et modifiez :

```php
define('SECRET_TOKEN', 'CHANGEZ_CE_TOKEN_SECRET');
```

Remplacez par un token sécurisé (exemple : `LyceePad2026SecretKey!@#`).
**⚠️ GARDEZ CE TOKEN SECRET ET COMPLEXE**

#### **B) Configurer le script de déploiement**

**Pour Linux/Unix** (`deploy.sh`) :
```bash
PROJECT_DIR="/var/www/html/LyceePad"  # Chemin complet vers votre projet
```

**Pour Windows** (`deploy.ps1`) :
```powershell
$ProjectDir = "C:\inetpub\wwwroot\LyceePad"  # Chemin complet vers votre projet
```

### Étape 5 : Rendre le script exécutable (Linux/Unix uniquement)

```bash
chmod +x deployment/deploy.sh
```

### Étape 6 : Tester l'accès au webhook

Accédez à : `http://votreserveur.lycee.fr/LyceePad/deployment/webhook.php`

Vous devriez voir : `Method Not Allowed` (c'est normal !)

---

## 🔧 Configuration GitHub

### Étape 1 : Générer un secret token

Utilisez le même token que dans `webhook.php` (défini à l'Étape 4A)

### Étape 2 : Ajouter le Webhook sur GitHub

1. Allez sur : https://github.com/nozap271206-web/LyceePad-APP/settings/hooks
2. Cliquez sur **"Add webhook"**
3. Remplissez les champs :

**Payload URL** :
```
http://votreserveur.lycee.fr/LyceePad/deployment/webhook.php
```

**Content type** :
```
application/json
```

**Secret** :
```
LyceePad2026SecretKey!@#
```
(Utilisez le même token que dans webhook.php)

**Which events would you like to trigger this webhook?** :
- ☑️ Just the push event

**Active** :
- ☑️ Coché

4. Cliquez sur **"Add webhook"**

### Étape 3 : Test du Webhook

GitHub va automatiquement envoyer un ping. Vérifiez :

1. Sur GitHub : https://github.com/nozap271206-web/LyceePad-APP/settings/hooks
2. Cliquez sur le webhook créé
3. Scrollez vers **"Recent Deliveries"**
4. Vous devriez voir un ✅ vert

---

## ✅ Test du Déploiement Automatique

### Test complet :

1. **Faites une modification** dans VS Code
2. **Committez et pushez** :
   ```bash
   git add .
   git commit -m "Test déploiement automatique"
   git push
   ```
3. **Vérifiez les logs** sur le serveur :
   ```bash
   cat deployment/webhook.log
   cat deployment/deploy.log
   ```

### Si tout fonctionne :
- ✅ Les logs montrent "SUCCESS: Déploiement réussi"
- ✅ Les modifications apparaissent sur : `http://votreserveur.lycee.fr/LyceePad/`

---

## 🔒 Sécurité

### Recommandations :

1. **HTTPS obligatoire** : Configurez SSL sur votre serveur
2. **Token complexe** : Minimum 32 caractères aléatoires
3. **Logs protégés** : Ajoutez dans `deployment/.htaccess` :
   ```apache
   <Files "*.log">
       Require all denied
   </Files>
   ```
4. **Permissions** :
   ```bash
   chmod 755 deployment/
   chmod 644 deployment/*.php
   chmod 600 deployment/*.log
   ```

---

## 🐛 Dépannage

### Le webhook ne se déclenche pas
- Vérifiez que l'URL est accessible publiquement
- Consultez les "Recent Deliveries" sur GitHub

### Erreur 403 (Forbidden)
- Vérifiez que le SECRET_TOKEN est identique sur GitHub et dans webhook.php

### Erreur 500 (Internal Server Error)
- Vérifiez les logs PHP du serveur
- Vérifiez que `deploy.sh` est exécutable

### Le script ne met pas à jour le code
- Vérifiez que le chemin `PROJECT_DIR` est correct
- Vérifiez les permissions Git sur le serveur

---

## 📞 Support

En cas de problème :
1. Consultez `deployment/webhook.log`
2. Consultez `deployment/deploy.log`
3. Vérifiez les logs du serveur web

---

## 🎯 URL Importantes

- **Dépôt GitHub** : https://github.com/nozap271206-web/LyceePad-APP
- **Webhooks GitHub** : https://github.com/nozap271206-web/LyceePad-APP/settings/hooks
- **Webhook endpoint** : `http://votreserveur.lycee.fr/LyceePad/deployment/webhook.php`

---

**✨ Une fois configuré, chaque `git push` déclenchera automatiquement la mise à jour du serveur !**
