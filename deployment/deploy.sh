#!/bin/bash
###############################################################################
# Script de déploiement automatique pour LyceePad
# Ce script est appelé par webhook.php lors d'un push sur GitHub
###############################################################################

# Configuration
PROJECT_DIR="/var/www/html/LyceePad"  # CHANGEZ avec le chemin de votre projet sur le serveur
LOG_FILE="$(dirname "$0")/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Fonction de log
log() {
    echo "[${TIMESTAMP}] $1" | tee -a "${LOG_FILE}"
}

# Début du déploiement
log "===== DÉBUT DU DÉPLOIEMENT ====="

# Vérification que le dossier existe
if [ ! -d "$PROJECT_DIR" ]; then
    log "ERREUR: Le dossier du projet n'existe pas: $PROJECT_DIR"
    exit 1
fi

# Accès au dossier du projet
cd "$PROJECT_DIR" || {
    log "ERREUR: Impossible d'accéder au dossier: $PROJECT_DIR"
    exit 1
}

log "Dossier du projet: $PROJECT_DIR"

# Sauvegarde des fichiers locaux modifiés (si nécessaire)
if [ -n "$(git status --porcelain)" ]; then
    log "AVERTISSEMENT: Fichiers locaux modifiés détectés"
    git stash save "Auto-stash before deploy at $TIMESTAMP"
    log "Fichiers mis en stash"
fi

# Récupération des dernières modifications
log "Récupération des mises à jour depuis GitHub..."
git fetch origin main

# Mise à jour du code
log "Application des mises à jour..."
git reset --hard origin/main

# Installation/mise à jour des dépendances (si package.json existe)
if [ -f "package.json" ]; then
    log "Mise à jour des dépendances npm..."
    npm install --production
fi

# Permissions (ajustez selon vos besoins)
log "Ajustement des permissions..."
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;

# Affichage du dernier commit
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %an: %s (%ar)")
log "Dernier commit: $LAST_COMMIT"

log "===== DÉPLOIEMENT TERMINÉ AVEC SUCCÈS ====="

exit 0
