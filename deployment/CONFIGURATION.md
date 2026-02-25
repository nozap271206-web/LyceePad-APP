# Configuration du Déploiement Automatique - LyceePad

## À REMPLIR AVANT L'INSTALLATION

### 1. Informations du Serveur

**Système d'exploitation du serveur** :
[ ] Linux/Unix
[ ] Windows

**Chemin complet vers le projet sur le serveur** :
Exemple Linux : /var/www/html/LyceePad
Exemple Windows : C:\inetpub\wwwroot\LyceePad
Votre chemin : _________________________________

**URL publique du webhook** :
Exemple : http://lycee-saint-eloi.fr/LyceePad/deployment/webhook.php
Votre URL : _________________________________

### 2. Token Secret

**Générez un token sécurisé** (32+ caractères avec lettres, chiffres, symboles) :
Exemple : LyceePad2026!SecretToken#WebHook@2026
Votre token : _________________________________

⚠️ IMPORTANT : Utilisez le MÊME token dans :
- webhook.php (ligne 8)
- Configuration GitHub (Webhooks settings)

### 3. Permissions Requises

**Sur le serveur, exécutez** :
```bash
# Linux/Unix uniquement
chmod +x deployment/deploy.sh
chmod 644 deployment/webhook.php
chmod 755 deployment/
```

### 4. Test de Configuration

**Testez l'accès au webhook** :
URL : http://VOTRE_SERVEUR/LyceePad/deployment/webhook.php
Résultat attendu : "Method Not Allowed" (c'est normal !)

### 5. Configuration GitHub

**URL des Webhooks** : https://github.com/nozap271206-web/LyceePad-APP/settings/hooks

**Paramètres à remplir** :
- Payload URL : [Votre URL du point 1]
- Content type : application/json
- Secret : [Votre token du point 2]
- Events : Just the push event

### 6. Contact Technique

**Responsable serveur au lycée** :
Nom : _________________________________
Email : _________________________________
Téléphone : _________________________________

**Informations d'accès serveur** :
FTP/SFTP : _________________________________
SSH : _________________________________

---

## Checklist d'Installation

- [ ] Projet cloné sur le serveur
- [ ] Dossier `deployment/` créé
- [ ] Fichiers webhook.php, deploy.sh/.ps1 uploadés
- [ ] Token secret généré et noté
- [ ] webhook.php configuré avec le token
- [ ] deploy.sh/.ps1 configuré avec le bon chemin
- [ ] Permissions appliquées (Linux/Unix)
- [ ] .htaccess en place
- [ ] Webhook créé sur GitHub
- [ ] Test ping GitHub réussi (✅ vert)
- [ ] Test de déploiement effectué
- [ ] Logs vérifiés (webhook.log, deploy.log)

---

**Date d'installation** : ____ / ____ / ______
**Installé par** : _________________________________
**Statut** : [ ] Fonctionnel  [ ] En test  [ ] À corriger
