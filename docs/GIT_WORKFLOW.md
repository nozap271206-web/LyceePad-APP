# 🌳 Workflow Git - Guide pratique

Ce document explique comment utiliser Git au quotidien sur le projet LycéePad.

## 📊 Schéma des branches

```
main (production)
  ↑
  │ (merge via PR)
  │
develop (développement)
  ↑
  │ (merge via PR)
  │
feature/ma-feature (fonctionnalités)
fix/mon-fix (corrections)
```

## 🚀 Workflow quotidien

### 1️⃣ Démarrer une nouvelle fonctionnalité

```bash
# S'assurer d'être à jour
git checkout develop
git pull origin develop

# Créer une nouvelle branche
git checkout -b feature/nom-fonctionnalite

# Exemple concret
git checkout -b feature/amelioration-carte
```

### 2️⃣ Développer et committer

```bash
# Faire vos modifications...

# Voir ce qui a changé
git status

# Ajouter les fichiers modifiés
git add www/js/map.js www/css/map.css

# Ou tout ajouter
git add .

# Committer avec un message conventionnel
git commit -m "feat(map): ajout zoom automatique sur zone"

# Continuer à développer et committer...
git commit -m "feat(map): ajout bouton reset vue"
```

### 3️⃣ Pousser votre branche

```bash
# Première fois
git push -u origin feature/amelioration-carte

# Les fois suivantes
git push
```

### 4️⃣ Créer une Pull Request

1. Allez sur GitHub : https://github.com/nozap271206-web/LyceePad-APP
2. Cliquez sur "Compare & pull request"
3. **Base** : `develop` ← **Compare** : `feature/amelioration-carte`
4. Remplissez le template de PR
5. Demandez une review
6. Une fois approuvé, cliquez "Merge"

### 5️⃣ Nettoyer après merge

```bash
# Revenir sur develop
git checkout develop

# Récupérer les dernières modifications
git pull origin develop

# Supprimer la branche locale
git branch -d feature/amelioration-carte

# Supprimer la branche distante
git push origin --delete feature/amelioration-carte
```

## 🐛 Corriger un bug

```bash
# Depuis develop
git checkout develop
git pull origin develop

# Créer une branche fix
git checkout -b fix/scanner-crash

# Corriger...
git add .
git commit -m "fix(scanner): correction crash lors scan invalide"

# Pousser et créer PR vers develop
git push -u origin fix/scanner-crash
```

## 🚨 Correction urgente en production (hotfix)

```bash
# Depuis main (production)
git checkout main
git pull origin main

# Créer hotfix
git checkout -b hotfix/crash-critique

# Corriger...
git commit -m "hotfix: correction crash au lancement"

# Merger dans main
git checkout main
git merge hotfix/crash-critique
git push origin main

# IMPORTANT : Aussi merger dans develop !
git checkout develop
git merge hotfix/crash-critique
git push origin develop

# Nettoyer
git branch -d hotfix/crash-critique
```

## 📝 Messages de commit

### Format
```
type(scope): description courte

[corps optionnel]
```

### Types
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage, style
- `refactor` : Refactorisation
- `test` : Tests
- `chore` : Maintenance, config

### Exemples

```bash
# ✅ BON
git commit -m "feat(quiz): ajout timer par question"
git commit -m "fix(db): correction requête zones"
git commit -m "docs(readme): mise à jour installation"
git commit -m "refactor(scanner): simplification logique scan"

# ❌ MAUVAIS
git commit -m "modifications"
git commit -m "fix bug"
git commit -m "WIP"
git commit -m "ça marche enfin!!!"
```

## 🔄 Synchroniser sa branche avec develop

Si vous travaillez longtemps sur une feature, develop peut évoluer :

```bash
# Depuis votre branche feature
git checkout feature/ma-feature

# Récupérer les dernières modifs de develop
git fetch origin
git merge origin/develop

# Ou en rebase (plus propre)
git rebase origin/develop

# Résoudre les conflits si nécessaire
# Puis pousser
git push
```

## ⚠️ À NE JAMAIS FAIRE

❌ **Committer directement sur main**
```bash
# NE JAMAIS FAIRE ÇA !
git checkout main
git commit -m "quick fix"
git push origin main
```

❌ **Pousser du code non testé**
```bash
# Toujours tester avant !
cordova build android
# Vérifier que ça compile sans erreur
# PUIS commit et push
```

❌ **Committer des fichiers sensibles**
```bash
# Vérifier le .gitignore !
# Pas de :
# - *.keystore (sauf exception)
# - node_modules/
# - .env avec secrets
# - fichiers de config locaux
```

## 🎯 Commandes utiles

```bash
# Voir l'historique
git log --oneline --graph --all

# Voir les branches
git branch -a

# Annuler le dernier commit (garder les modifs)
git reset HEAD~1

# Annuler toutes les modifications non commitées
git restore .

# Voir les différences
git diff

# Stash (mettre de côté temporairement)
git stash
git stash pop

# Changer le message du dernier commit
git commit --amend -m "nouveau message"
```

## 📞 Aide

En cas de problème :
1. `git status` pour comprendre l'état
2. Consultez [CONTRIBUTING.md](../CONTRIBUTING.md)
3. Demandez de l'aide à l'équipe
4. Google : "git [votre problème]"

## 🔗 Ressources

- [Documentation Git officielle](https://git-scm.com/doc)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Comprendre Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

---

💡 **Astuce** : Créez un alias pour les commandes fréquentes !

```bash
# Dans votre .gitconfig
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```
