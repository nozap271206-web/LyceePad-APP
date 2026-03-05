# Script de deploiement COMPLET LyceePad vers 192.168.15.38
# Copie tous les fichiers du projet

$SERVER = "admin@192.168.15.38"
$REMOTE_PATH = "/var/www/html"
$LOCAL_PATH = "D:\Lycee\0-Tech\0-PROJET\Android\LyceePad\www"

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "   DEPLOIEMENT COMPLET - LyceePad" -ForegroundColor Cyan
Write-Host "   Serveur: 192.168.15.38" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Etape 1 : Sauvegarde (optionnel)
Write-Host "[1/4] Sauvegarde du serveur..." -ForegroundColor Yellow
ssh $SERVER "cd /var/www && tar -czf html_backup_$(date +%Y%m%d_%H%M%S).tar.gz html 2>/dev/null || true"
Write-Host "  - Sauvegarde creee" -ForegroundColor Green

# Etape 2 : Nettoyage du repertoire distant
Write-Host "`n[2/4] Preparation du serveur..." -ForegroundColor Yellow
Write-Host "  - Nettoyage des anciens fichiers" -ForegroundColor Gray
ssh $SERVER "rm -rf $REMOTE_PATH/*"
Write-Host "  - Creation de la structure" -ForegroundColor Gray
ssh $SERVER "mkdir -p $REMOTE_PATH/{html,css,js,img,lib,res,API,data}"

# Etape 3 : Copie COMPLETE du projet
Write-Host "`n[3/4] Copie de tous les fichiers..." -ForegroundColor Yellow

# Fichiers racine
Write-Host "  - index.html, splash.html" -ForegroundColor Gray
scp "$LOCAL_PATH\index.html" "${SERVER}:$REMOTE_PATH/"
scp "$LOCAL_PATH\splash.html" "${SERVER}:$REMOTE_PATH/"

# Dossier HTML (toutes les pages)
Write-Host "  - Dossier html/ (7 pages)" -ForegroundColor Gray
scp -r "$LOCAL_PATH\html" "${SERVER}:$REMOTE_PATH/"

# Dossier CSS (tous les styles)
Write-Host "  - Dossier css/ (tous les styles)" -ForegroundColor Gray
scp -r "$LOCAL_PATH\css" "${SERVER}:$REMOTE_PATH/"

# Dossier JS (tous les scripts)
Write-Host "  - Dossier js/ (tous les scripts)" -ForegroundColor Gray
scp -r "$LOCAL_PATH\js" "${SERVER}:$REMOTE_PATH/"

# Dossier IMG (toutes les images)
Write-Host "  - Dossier img/ (images)" -ForegroundColor Gray
scp -r "$LOCAL_PATH\img" "${SERVER}:$REMOTE_PATH/"

# Dossier LIB (bibliotheques)
Write-Host "  - Dossier lib/ (FontAwesome + QRCode)" -ForegroundColor Gray
scp -r "$LOCAL_PATH\lib" "${SERVER}:$REMOTE_PATH/"

# Dossier RES (ressources)
Write-Host "  - Dossier res/ (ressources)" -ForegroundColor Gray
scp -r "$LOCAL_PATH\res" "${SERVER}:$REMOTE_PATH/"

# Dossier API (si existe)
if (Test-Path "$LOCAL_PATH\API") {
    Write-Host "  - Dossier API/ (sync.php)" -ForegroundColor Gray
    scp -r "$LOCAL_PATH\API" "${SERVER}:$REMOTE_PATH/"
}

# Donnees JSON (si dans www/)
if (Test-Path "$LOCAL_PATH\..\deployment\webhook.php") {
    Write-Host "  - webhook.php" -ForegroundColor Gray
    scp "$LOCAL_PATH\..\deployment\webhook.php" "${SERVER}:/var/www/"
}

# Etape 4 : Configuration des permissions
Write-Host "`n[4/4] Configuration des permissions..." -ForegroundColor Yellow
ssh $SERVER "chmod -R 755 $REMOTE_PATH"
ssh $SERVER "chown -R www-data:www-data $REMOTE_PATH 2>/dev/null || chown -R apache:apache $REMOTE_PATH 2>/dev/null || true"
Write-Host "  - Permissions configurees" -ForegroundColor Green

# Verification
Write-Host "`n================================================" -ForegroundColor Green
Write-Host "   DEPLOIEMENT TERMINE AVEC SUCCES" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Green

Write-Host "URLs accessibles :" -ForegroundColor Cyan
Write-Host "  - Accueil :      http://192.168.15.38/index.html" -ForegroundColor White
Write-Host "  - Carte :        http://192.168.15.38/html/map.html" -ForegroundColor White
Write-Host "  - Scanner :      http://192.168.15.38/html/scanner.html" -ForegroundColor White
Write-Host "  - Quiz :         http://192.168.15.38/html/Quiz.html" -ForegroundColor White
Write-Host "  - A propos :     http://192.168.15.38/html/About.html" -ForegroundColor White
Write-Host "  - Login Admin :  http://192.168.15.38/html/login.html" -ForegroundColor Yellow
Write-Host "  - Admin :        http://192.168.15.38/html/Admin.html" -ForegroundColor Yellow
Write-Host "`nIdentifiants admin : admin / admin" -ForegroundColor Yellow

Write-Host "`nStatut du deploiement :" -ForegroundColor Cyan
ssh $SERVER "du -sh $REMOTE_PATH && ls -la $REMOTE_PATH | head -20"

Write-Host ""
