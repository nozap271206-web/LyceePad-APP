#!/bin/bash
PROJECT_DIR="/var/www/html/LyceePad"
LOG_FILE="$(dirname "$0")/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[${TIMESTAMP}] $1" | tee -a "${LOG_FILE}"
}

log "===== DÉBUT DU DÉPLOIEMENT ====="

if [ ! -d "$PROJECT_DIR" ]; then
    log "ERREUR: Le dossier du projet n'existe pas: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR" || {
    log "ERREUR: Impossible d'accéder au dossier: $PROJECT_DIR"
    exit 1
}

log "Dossier du projet: $PROJECT_DIR"

if [ -n "$(git status --porcelain)" ]; then
    log "AVERTISSEMENT: Fichiers locaux modifiés détectés"
    git stash save "Auto-stash before deploy at $TIMESTAMP"
    log "Fichiers mis en stash"
fi

log "Récupération des mises à jour depuis GitHub..."
git fetch origin main

log "Application des mises à jour..."
git reset --hard origin/main

LAST_COMMIT=$(git log -1 --pretty=format:"%h - %an: %s (%ar)")
log "Dernier commit: $LAST_COMMIT"

log "===== DÉPLOIEMENT TERMINÉ AVEC SUCCÈS ====="
exit 0
