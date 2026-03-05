# 🛠️ Guide d'administration LyceePad

## 📱 Accès à l'interface admin

L'interface d'administration permet de gérer le contenu de l'application depuis la tablette.

**URL :** `html/Admin.html`

Depuis n'importe quelle page, ajoutez un lien vers `Admin.html` dans la navigation.

---

## 🎯 Fonctionnalités

### 1. Gestion des zones

#### ✏️ Créer une nouvelle zone
1. Onglet **Zones**
2. Cliquer sur **Nouvelle zone**
3. Remplir le formulaire :
   - **Code QR*** : Identifiant unique (ex: `QR_SALLE_101`)
   - **Nom*** : Nom de la zone (ex: "Salle 101")
   - **Bâtiment** : Nom du bâtiment (ex: "Bâtiment A")
   - **Étage** : Numéro d'étage (ex: `1`)
   - **Latitude/Longitude** : Coordonnées GPS
   - **Description** : Texte court
   - **Zone active** : Cocher pour activer
4. Cliquer sur **Enregistrer**

✅ La zone est créée **localement** sur la tablette

#### 📝 Modifier une zone
1. Trouver la zone dans la liste
2. Cliquer sur **Modifier**
3. Modifier les champs
4. **Enregistrer**

#### 🗑️ Supprimer une zone
1. Trouver la zone
2. Cliquer sur l'icône **🗑️**
3. Confirmer la suppression

⚠️ **Attention** : La suppression est locale jusqu'à synchronisation

---

### 2. Synchronisation

#### ⬇️ Télécharger depuis le serveur

Récupère les dernières données du serveur et **écrase les modifications locales**.

1. Onglet **Synchronisation**
2. Cliquer sur **Télécharger depuis serveur**
3. Attendre la fin du téléchargement

✅ Toutes les tablettes verront les mêmes données

#### ⬆️ Pousser vers le serveur

Envoie les modifications locales au serveur et met à jour la base MySQL.

1. Vérifier que le badge indique **🟢 Synchro** (serveur accessible)
2. Onglet **Synchronisation**
3. Cliquer sur **Pousser vers serveur**
4. Confirmer l'opération

**Ce qui se passe :**
- Envoi des données vers `192.168.15.38/api/sync.php`
- Mise à jour de la base MySQL
- Régénération de `qr-data.json`
- Incrémentation de la version (ex: 1.0.0 → 1.0.1)
- Toutes les autres tablettes téléchargeront automatiquement

⚠️ **Attention** : Cette action écrase les données du serveur !

#### 🔄 Réinitialiser local

Vide la base locale et re-télécharge depuis le serveur.

Utile en cas de corruption ou pour annuler des modifications non voulues.

---

## 🔄 Workflow de mise à jour complet

### Scénario 1 : Ajouter une nouvelle zone

```
1. Tablette Admin
   ├─ Créer zone "Salle 102"
   ├─ Vérifier les infos
   └─ Pousser vers serveur
   
2. Serveur (192.168.15.38)
   ├─ Reçoit les données
   ├─ Met à jour MySQL
   ├─ Régénère qr-data.json (v1.0.1)
   └─ Sauvegarde db-version.json
   
3. Autres tablettes
   ├─ Ping toutes les 10s
   ├─ Détecte v1.0.1 (≠ v1.0.0)
   ├─ Télécharge qr-data.json
   └─ Affiche "Salle 102" automatiquement
```

### Scénario 2 : Modifier plusieurs zones

```
1. Admin modifie localement
   ├─ Zone A : GPS mis à jour
   ├─ Zone B : Nom changé
   └─ Zone C : Description ajoutée
   
2. Pousser TOUT vers serveur d'un coup
   ├─ Envoi des 30 zones
   ├─ Serveur met à jour MySQL
   └─ Version 1.0.0 → 1.0.1
   
3. Synchronisation globale
   └─ Toutes les tablettes reçoivent la v1.0.1
```

---

## 🔧 Configuration serveur requise

### 1. Déployer l'API PHP

Copier `www/API/sync.php` sur le serveur :

```bash
scp www/API/sync.php admin@192.168.15.38:/var/www/html/api/
```

### 2. Configurer la base de données

Modifier dans `sync.php` :

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'lyceepad');
define('DB_USER', 'lyceepad_user');
define('DB_PASS', 'VOTRE_MOT_DE_PASSE');
```

### 3. Donner les permissions

```bash
# Permissions pour écrire les fichiers JSON
sudo chmod 755 /var/www/html/data
sudo chmod 644 /var/www/html/data/*.json
sudo chown www-data:www-data /var/www/html/data/*.json
```

---

## 🔍 Dépannage

### Badge affiche "🟡 Local"

**Problème** : Le serveur est inaccessible

**Solutions** :
1. Vérifier que la tablette est sur le réseau `192.168.15.X`
2. Ping le serveur : `ping 192.168.15.38`
3. Vérifier le pare-feu du serveur
4. Vérifier que nginx/apache est démarré

### Erreur "Impossible de pousser"

**Problème** : L'API ne répond pas

**Solutions** :
1. Vérifier que `sync.php` existe sur le serveur
2. Vérifier les permissions du fichier
3. Vérifier les logs Apache : `sudo tail -f /var/log/nginx/error.log`
4. Tester l'API manuellement : `curl http://192.168.15.38/api/sync.php`

### Zone créée mais pas visible sur carte

**Problème** : Coordonnées GPS manquantes

**Solutions** :
1. Modifier la zone
2. Ajouter Latitude et Longitude
3. Enregistrer
4. Pousser vers serveur

---

## 📊 Journal de synchronisation

Le journal affiche toutes les opérations :

- ✓ **Vert** : Succès
- ✗ **Rouge** : Erreur
- ℹ **Bleu** : Information

Utile pour déboguer les problèmes de synchronisation.

---

## ⚠️ Bonnes pratiques

### ✅ À faire

- **Toujours vérifier** le badge avant de pousser (doit être vert)
- **Tester localement** avant de pousser vers serveur
- **Sauvegarder régulièrement** la base MySQL côté serveur
- **Documenter** les changements importants

### ❌ À éviter

- Ne **jamais** pousser si le badge est rouge/orange
- Ne **pas** modifier en même temps sur plusieurs tablettes
- Ne **pas** supprimer de zones sans backup
- Ne **pas** oublier de pousser après modifications

---

## 🔐 Sécurité (TODO - À améliorer)

⚠️ **Actuellement, l'admin est accessible sans authentification**

Pour la production, ajoutez :

1. **Page de login**
2. **Mot de passe admin**
3. **Token JWT** pour l'API
4. **Logs** des modifications
5. **Backup automatique** avant push

---

## 📱 Accès rapide

Ajoutez un bouton dans la navigation de toutes les pages :

```html
<a href="html/Admin.html" class="nav-link admin-link">
  <i class="fas fa-tools"></i> Admin
</a>
```

Avec un style distinct :

```css
.admin-link {
  color: #f59e0b !important;
  border: 1px solid #f59e0b;
  padding: 8px 16px;
  border-radius: 8px;
}
```

---

**Interface admin prête à l'emploi ! 🚀**

*Prochaine étape : Ajouter la gestion des contenus (images, vidéos, textes)*
