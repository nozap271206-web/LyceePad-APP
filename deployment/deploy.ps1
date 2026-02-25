# Script de déploiement automatique pour LyceePad (Windows PowerShell)
# Ce script est appelé par webhook.php lors d'un push sur GitHub

# Configuration
$ProjectDir = "C:\inetpub\wwwroot\LyceePad"  # CHANGEZ avec le chemin de votre projet
$LogFile = Join-Path $PSScriptRoot "deploy.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Fonction de log
function Write-Log {
    param([string]$Message)
    $LogEntry = "[$Timestamp] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

# Début du déploiement
Write-Log "===== DÉBUT DU DÉPLOIEMENT ====="

# Vérification que le dossier existe
if (-not (Test-Path $ProjectDir)) {
    Write-Log "ERREUR: Le dossier du projet n'existe pas: $ProjectDir"
    exit 1
}

# Accès au dossier du projet
Set-Location $ProjectDir
Write-Log "Dossier du projet: $ProjectDir"

# Sauvegarde des fichiers locaux modifiés
$GitStatus = git status --porcelain
if ($GitStatus) {
    Write-Log "AVERTISSEMENT: Fichiers locaux modifiés détectés"
    git stash save "Auto-stash before deploy at $Timestamp"
    Write-Log "Fichiers mis en stash"
}

# Récupération des dernières modifications
Write-Log "Récupération des mises à jour depuis GitHub..."
git fetch origin main

# Mise à jour du code
Write-Log "Application des mises à jour..."
git reset --hard origin/main

# Installation/mise à jour des dépendances
if (Test-Path "package.json") {
    Write-Log "Mise à jour des dépendances npm..."
    npm install --production
}

# Affichage du dernier commit
$LastCommit = git log -1 --pretty=format:"%h - %an: %s (%ar)"
Write-Log "Dernier commit: $LastCommit"

Write-Log "===== DÉPLOIEMENT TERMINÉ AVEC SUCCÈS ====="

exit 0
