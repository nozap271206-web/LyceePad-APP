# 🔧 Guide Webhook Simplifié - Vos 2 Projets

## 📁 Vos Deux Projets

Vous avez **2 projets différents** :

### 1️⃣ LyceePad (Application Mobile Android)
**Emplacement :** `D:\Lycee\0-Tech\0-PROJET\Android\LyceePad`
- ✅ **Dépôt GitHub** : https://github.com/nozap271206-web/LyceePad-APP
- ✅ **Fichiers webhook** : Déjà présents dans `deployment/`
- 📱 **Utilité** : Application Cordova pour tablettes
- 🔄 **Déploiement** : Webhook pour mettre à jour l'app sur serveur web

### 2️⃣ RacinelyceePad (Serveur Backend)
**Emplacement :** `D:\Lycee\0-Tech\0-PROJET\RacinelyceePad`
- ❌ **Pas de dépôt GitHub** actuellement
- ❌ **Pas de fichiers webhook**
- 🖥️ **Utilité** : Serveur Node.js + API + Frontend web (dossier `Public/`)
- ⚙️ **Fonctionne** : Localement sur votre PC

---

## ⚠️ Le Problème

**Webhook ne peut fonctionner QUE si :**
1. Le projet est sur GitHub
2. Le serveur distant (lycée) peut recevoir des requêtes HTTP de GitHub
3. PHP est installé sur le serveur distant

**Pour RacinelyceePad :**
- ❌ Pas de dépôt Git → Pas de GitHub → Pas de webhook possible actuellement

---

## ✅ Solution Recommandée

### Option A : Créer un dépôt GitHub pour RacinelyceePad

Si vous voulez déployer automatiquement le serveur backend :

**Étape 1 : Initialiser Git**
```powershell
cd D:\Lycee\0-Tech\0-PROJET\RacinelyceePad
git init
git add .
git commit -m "Initial commit: Serveur backend LyceePad"
```

**Étape 2 : Créer dépôt sur GitHub**
1. Aller sur https://github.com/new
2. Nom du repo : `LyceePad-Backend`
3. Créer le repository

**Étape 3 : Lier et pousser**
```powershell
git remote add origin https://github.com/nozap271206-web/LyceePad-Backend.git
git branch -M main
git push -u origin main
```

**Étape 4 : Copier les fichiers webhook**
```powershell
# Créer dossier deployment
New-Item -ItemType Directory -Path "deployment"

# Je vais créer les fichiers pour vous (voir ci-dessous)
```

---

### Option B : Manuel (Pas de webhook)

Si le serveur du lycée n'accepte pas les webhooks :

**Sur le serveur du lycée** (chaque fois que vous voulez mettre à jour) :
```bash
cd /var/www/html/RacinelyceePad
git pull origin main
npm install
# Redémarrer le serveur Node.js
```

---

## 🎯 Pour LyceePad (App Mobile) - Déjà Configuré

Vos fichiers webhook dans `LyceePad/deployment/` sont **déjà prêts** !

### Ce qu'il faut modifier

**1. Sur votre serveur du lycée :**

Uploadez le dossier `deployment/` entier vers :
```
/var/www/html/LyceePad/deployment/
```

**2. Modifier `webhook.php` (ligne 8) :**
```php
// Générez un token avec cette commande PowerShell
# -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})

define('SECRET_TOKEN', 'xY7mN3pQ9rT5vB2nC8dF4gH6jK1lW0zS'); // Exemple - CHANGEZ-LE
```

**3. Modifier `deploy.sh` (ligne 8) :**
```bash
PROJECT_DIR="/var/www/html/LyceePad"  # Chemin sur VOTRE serveur
```

**4. Sur GitHub :**
- **Settings → Webhooks → Add webhook**
- **URL :** `http://IP-SERVEUR-LYCEE/LyceePad/deployment/webhook.php`
- **Secret :** Le même token qu'au point 2
- **Event :** Just the push event
- **Active :** ✅

---

## 🔍 Diagnostiquer le Problème

### Vous dites "ça bloque à define('SECRET_TOKEN'...)"

**Questions :**

1. **Où essayez-vous de modifier ce fichier ?**
   - ✅ Sur le serveur du lycée (correct)
   - ❌ Sur votre PC (ne sert à rien)

2. **Quel projet voulez-vous déployer ?**
   - **LyceePad** (app mobile) → Utilisez les fichiers dans `LyceePad/deployment/`
   - **RacinelyceePad** (serveur backend) → Doit d'abord être sur GitHub

3. **Avez-vous accès au serveur du lycée ?**
   - Via SSH ? FTP ? Autre ?
   - PHP est-il installé ?
   - Apache/Nginx configuré ?

---

## 📊 Tableau Récapitulatif

| **Critère** | **LyceePad (App)** | **RacinelyceePad (Serveur)** |
|-------------|-------------------|------------------------------|
| **GitHub** | ✅ Oui | ❌ Non |
| **Webhook prêt** | ✅ Oui (`deployment/`) | ❌ Non |
| **Déploiement Auto** | ✅ Possible | ❌ Pas encore |
| **Utilisation** | App tablette | API backend |

---

## 🚀 Guide Étape par Étape (LyceePad App)

### Prérequis
- [ ] Serveur du lycée accessible
- [ ] PHP installé sur le serveur
- [ ] Apache/Nginx configuré
- [ ] Accès SSH ou FTP

### Configuration

**1. Générer un token secret**
```powershell
# Sur votre PC
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```
**Résultat exemple :** `aB3xK9mP2qR8tY5jL4nW7vC1dF6gH0sZ`

**⚠️ Notez ce token !**

---

**2. Sur votre PC - Modifier les fichiers**

**Fichier : `deployment/webhook.php`**
```php
// LIGNE 8 - Remplacez
define('SECRET_TOKEN', 'aB3xK9mP2qR8tY5jL4nW7vC1dF6gH0sZ');
```

**Fichier : `deployment/deploy.sh`**
```bash
# LIGNE 8 - Remplacez avec le chemin réel
PROJECT_DIR="/var/www/html/LyceePad"
```

---

**3. Upload vers le serveur**

Transférez le dossier `deployment/` vers :
```
/var/www/html/LyceePad/deployment/
```

Via FTP, SCP, ou autre méthode d'accès.

---

**4. Sur le serveur - Permissions**
```bash
cd /var/www/html/LyceePad/deployment
chmod 755 deploy.sh
chmod 644 webhook.php
chmod 666 webhook.log
chmod 666 deploy.log
```

---

**5. Tester l'accès au webhook**

Dans un navigateur :
```
http://IP-SERVEUR-LYCEE/LyceePad/deployment/webhook.php
```

**Résultat attendu :** `Method Not Allowed` (c'est normal !)

Si erreur PHP → Vérifier que PHP est installé

---

**6. Configurer GitHub**

1. https://github.com/nozap271206-web/LyceePad-APP/settings/hooks
2. **Add webhook**
3. Remplir :
   - **Payload URL :** `http://IP-SERVEUR/LyceePad/deployment/webhook.php`
   - **Content type :** `application/json`
   - **Secret :** Votre token (ex: `aB3xK9mP2qR8tY5jL4nW7vC1dF6gH0sZ`)
   - **Events :** Just the push event
   - **Active :** ✅
4. **Add webhook**

---

**7. Tester**
```powershell
# Sur votre PC
cd D:\Lycee\0-Tech\0-PROJET\Android\LyceePad
echo "test" >> README.md
git add README.md
git commit -m "test: Webhook"
git push origin main
```

---

**8. Vérifier**

Sur GitHub :
- Settings → Webhooks → Votre webhook
- Onglet **Recent Deliveries**
- Doit voir une requête avec ✅

Sur le serveur :
```bash
cat /var/www/html/LyceePad/deployment/webhook.log
cat /var/www/html/LyceePad/deployment/deploy.log
```

---

## 🆘 Dépannage

### "ça bloque à define('SECRET_TOKEN'...)"

**Possibilités :**

1. **Vous modifiez le fichier local** (sur votre PC)
   - ❌ Ne changera rien sur le serveur
   - ✅ Modifiez d'abord localement, PUIS uploadez

2. **Le fichier n'est pas sur le serveur**
   - Vérifiez que `webhook.php` existe sur le serveur
   - Chemin : `/var/www/html/LyceePad/deployment/webhook.php`

3. **Erreur de syntaxe PHP**
   - Le token doit être entre quotes : `'VotreToken'`
   - Pas d'espaces, pas de caractères spéciaux ( sauf lettres/chiffres)

4. **Pas d'accès au serveur**
   - Demandez accès SSH/FTP à l'admin réseau
   - Ou demandez-leur de configurer pour vous

---

## 💡 Recommandation

**Pour RacinelyceePad (votre serveur backend) :**

Je vous recommande de :
1. Créer un dépôt GitHub pour RacinelyceePad
2. Commiter tout le code
3. Je créerai les fichiers webhook adaptés

**Pour LyceePad (app mobile) :**
- Les fichiers webhook sont déjà prêts
- Suivre le guide ci-dessus

---

## 📞 Prochaines Actions

**Dites-moi :**

1. **Quel projet voulez-vous déployer automatiquement ?**
   - [ ] LyceePad (app mobile) 
   - [ ] RacinelyceePad (serveur backend)
   - [ ] Les deux

2. **Avez-vous accès au serveur du lycée ?**
   - [ ] Oui, via SSH
   - [ ] Oui, via FTP
   - [ ] Non, je dois demander à l'admin

3. **Le serveur du lycée a-t-il PHP ?**
   - [ ] Oui
   - [ ] Je ne sais pas
   - [ ] Non

**Je vous aiderai en fonction de vos réponses ! 👍**

---

**Date :** 3 mars 2026  
**Fichiers webhook LyceePad :** Prêts dans `deployment/`  
**Fichiers webhook RacinelyceePad :** À créer si besoin
