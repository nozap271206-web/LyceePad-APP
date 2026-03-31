#!/bin/bash
###############################################################################
# Script de déploiement automatique pour LyceePad
###############################################################################

PROJECT_DIR="/var/www/html/LyceePad"
LOG_FILE="$(dirname "$0")/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

log() {
    echo "[${TIMESTAMP}] $1" | tee -a "${LOG_FILE}"
}

log "===== DÉBUT DU DÉPLOIEMENT ====="

if [ ! -d "$PROJECT_DIR" ]; then
    log "ERREUR: Dossier introuvable: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR" || { log "ERREUR: Impossible d'accéder à $PROJECT_DIR"; exit 1; }
log "Dossier: $PROJECT_DIR"

# Corriger les permissions .git pour que www-data puisse écrire
sudo chown -R www-data:www-data "$PROJECT_DIR/.git"

# Supprimer les fichiers non suivis qui bloqueraient le pull (ex: images uploadées)
git clean -fd --exclude="www/img/" 2>/dev/null || true

# Écraser toutes les modifications locales
git fetch origin main
git reset --hard origin/main

# Permissions sur les fichiers du projet (exclure node_modules)
find . -path ./node_modules -prune -o -type f -exec chmod 644 {} \;
find . -path ./node_modules -prune -o -type d -exec chmod 755 {} \;

LAST_COMMIT=$(git log -1 --pretty=format:"%h - %an: %s (%ar)")
log "Dernier commit: $LAST_COMMIT"
log "===== DÉPLOIEMENT TERMINÉ AVEC SUCCÈS ====="

exit 0
