# 🤝 Guide de contribution - LycéePad

Merci de contribuer au projet LycéePad ! Ce document décrit les bonnes pratiques à suivre.

## 📋 Table des matières

- [Stratégie de branches](#stratégie-de-branches)
- [Conventions de nommage](#conventions-de-nommage)
- [Processus de contribution](#processus-de-contribution)
- [Standards de code](#standards-de-code)
- [Messages de commit](#messages-de-commit)

## 🌳 Stratégie de branches

Nous utilisons une version simplifiée de **Git Flow** :

### Branches principales

#### `main` (Production)
- ✅ Code stable et testé
- ✅ Toujours déployable
- 🚫 **JAMAIS de commit direct**
- 🔒 Protégée : merge uniquement via Pull Request

#### `develop` (Développement)
- 🔧 Branche de développement active
- 🔄 Intégration continue des features
- ✅ Code fonctionnel mais en cours de test
- 🔀 Merge régulier vers `main` via Pull Request

### Branches temporaires

#### `feature/nom-fonctionnalite`
Nouvelles fonctionnalités
```bash
# Créer une feature
git checkout develop
git checkout -b feature/scanner-qr-ameliore

# Développer...
git add .
git commit -m "feat: amélioration du scanner QR"

# Pousser et créer une Pull Request vers develop
git push origin feature/scanner-qr-ameliore
```

#### `fix/nom-correction`
Corrections de bugs
```bash
# Créer un fix
git checkout develop
git checkout -b fix/carte-zoom-bug

# Corriger...
git commit -m "fix: correction du zoom de la carte"

# Pousser vers develop
git push origin fix/carte-zoom-bug
```

#### `hotfix/nom-urgence`
Corrections urgentes en production
```bash
# Créer depuis main
git checkout main
git checkout -b hotfix/crash-startup

# Corriger...
git commit -m "hotfix: correction crash au démarrage"

# Merger dans main ET develop
git checkout main
git merge hotfix/crash-startup
git checkout develop
git merge hotfix/crash-startup
```

#### `docs/nom-documentation`
Mises à jour de documentation
```bash
git checkout develop
git checkout -b docs/guide-installation
git commit -m "docs: mise à jour guide installation"
```

## 📝 Conventions de nommage

### Branches
- `feature/description-courte` : Nouvelle fonctionnalité
- `fix/description-bug` : Correction de bug
- `hotfix/description-urgence` : Correction urgente production
- `docs/description-doc` : Documentation
- `refactor/description` : Refactorisation code
- `test/description` : Ajout/modification tests

### Fichiers et dossiers
- **JavaScript** : camelCase (`dbManager.js`, `mapController.js`)
- **CSS** : kebab-case (`zone-content.css`, `admin-panel.css`)
- **HTML** : PascalCase (`ZoneContent.html`, `Admin.html`)
- **Dossiers** : kebab-case (`api-client/`, `data-models/`)

## 🔄 Processus de contribution

### 1. Créer une branche depuis develop
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ma-nouvelle-feature
```

### 2. Développer et tester
- Écrire du code propre et commenté
- Tester localement
- Valider que l'app fonctionne

### 3. Commit avec message conventionnel
```bash
git add .
git commit -m "feat: ajout nouveau module quiz"
```

### 4. Pousser la branche
```bash
git push origin feature/ma-nouvelle-feature
```

### 5. Créer une Pull Request
- Aller sur GitHub
- Créer une Pull Request vers `develop`
- Décrire les changements
- Demander une revue de code

### 6. Revue et merge
- Attendez l'approbation
- Corrigez les commentaires si nécessaire
- Une fois approuvé, mergez dans `develop`

### 7. Supprimer la branche
```bash
git branch -d feature/ma-nouvelle-feature
git push origin --delete feature/ma-nouvelle-feature
```

## 💻 Standards de code

### JavaScript
```javascript
// ✅ BON
function loadZoneContent(zoneId) {
    const zone = getZoneById(zoneId);
    if (!zone) {
        console.error('Zone not found:', zoneId);
        return null;
    }
    return zone;
}

// ❌ MAUVAIS
function lzc(z){return gzbi(z)||null}
```

### Commentaires
```javascript
/**
 * Charge le contenu d'une zone spécifique
 * @param {string} zoneId - ID de la zone à charger
 * @returns {Object|null} - Objet zone ou null si non trouvé
 */
function loadZoneContent(zoneId) {
    // Implémentation...
}
```

### Indentation
- **2 espaces** pour JavaScript
- **2 espaces** pour HTML
- **2 espaces** pour CSS

### Règles générales
- ✅ Noms de variables explicites
- ✅ Fonctions courtes (< 50 lignes)
- ✅ Gestion des erreurs
- ✅ Éviter la duplication de code
- ❌ Pas de `console.log()` en production
- ❌ Pas de code commenté (utiliser Git)

## 📝 Messages de commit

Utiliser le format **Conventional Commits** :

### Format
```
type(scope): description courte

[corps optionnel]

[footer optionnel]
```

### Types
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation uniquement
- `style`: Formatage, point-virgules manquants...
- `refactor`: Refactorisation sans changement fonctionnel
- `test`: Ajout ou modification de tests
- `chore`: Maintenance, config, dépendances...

### Exemples
```bash
# Nouvelle fonctionnalité
git commit -m "feat(scanner): ajout support QR codes multiples"

# Correction de bug
git commit -m "fix(quiz): correction calcul du score"

# Documentation
git commit -m "docs(readme): mise à jour instructions installation"

# Refactorisation
git commit -m "refactor(db): optimisation requêtes SQL"

# Maintenance
git commit -m "chore(deps): mise à jour Cordova 12.0.0"
```

## 🧪 Tests avant Pull Request

Avant de créer une Pull Request, vérifiez :

- [ ] L'application compile sans erreur
- [ ] Pas d'erreurs dans la console
- [ ] Les fonctionnalités existantes fonctionnent toujours
- [ ] La nouvelle feature fonctionne comme prévu
- [ ] Le code est propre et commenté
- [ ] Les fichiers temporaires sont exclus (.gitignore)

## ❓ Questions

Si vous avez des questions, n'hésitez pas à :
- Ouvrir une **Issue** sur GitHub
- Demander en équipe
- Consulter la documentation dans `/docs`

---

**Merci de contribuer à LycéePad ! 🚀**
