# Script de deploiement LyceePad vers 192.168.15.38
# A executer depuis PowerShell Windows

$SERVER = "admin@192.168.15.38"
$REMOTE_PATH = "/var/www/html"
$LOCAL_PATH = "D:\Lycee\0-Tech\0-PROJET\Android\LyceePad"

Write-Host "`n=== Deploiement LyceePad sur 192.168.15.38 ===" -ForegroundColor Cyan

# Etape 1 : Creation des repertoires
Write-Host "`n[1/3] Creation des repertoires sur le serveur..." -ForegroundColor Yellow
ssh $SERVER "mkdir -p $REMOTE_PATH/html $REMOTE_PATH/js $REMOTE_PATH/css $REMOTE_PATH/lib $REMOTE_PATH/api"

# Etape 2 : Copie des fichiers HTML
Write-Host "`n[2/3] Copie des fichiers..." -ForegroundColor Yellow

Write-Host "  - Admin.html" -ForegroundColor Gray
scp "$LOCAL_PATH\www\html\Admin.html" "${SERVER}:$REMOTE_PATH/html/"

Write-Host "  - login.html" -ForegroundColor Gray
scp "$LOCAL_PATH\www\html\login.html" "${SERVER}:$REMOTE_PATH/html/"

# Copie des fichiers JavaScript
Write-Host "  - Admin.js" -ForegroundColor Gray
scp "$LOCAL_PATH\www\js\Admin.js" "${SERVER}:$REMOTE_PATH/js/"

Write-Host "  - login.js" -ForegroundColor Gray
scp "$LOCAL_PATH\www\js\login.js" "${SERVER}:$REMOTE_PATH/js/"

Write-Host "  - db-manager.js" -ForegroundColor Gray
scp "$LOCAL_PATH\www\js\db-manager.js" "${SERVER}:$REMOTE_PATH/js/"

# Copie des fichiers CSS
Write-Host "  - Admin.css" -ForegroundColor Gray
scp "$LOCAL_PATH\www\css\Admin.css" "${SERVER}:$REMOTE_PATH/css/"

Write-Host "  - login.css" -ForegroundColor Gray
scp "$LOCAL_PATH\www\css\login.css" "${SERVER}:$REMOTE_PATH/css/"

# Copie de la bibliotheque QR Code
Write-Host "  - qrcode.min.js" -ForegroundColor Gray
scp "$LOCAL_PATH\www\lib\qrcode.min.js" "${SERVER}:$REMOTE_PATH/lib/"

# Copie de l'API (si elle existe)
if (Test-Path "$LOCAL_PATH\www\API\sync.php") {
    Write-Host "  - sync.php (API)" -ForegroundColor Gray
    scp "$LOCAL_PATH\www\API\sync.php" "${SERVER}:$REMOTE_PATH/api/"
}

Write-Host "`n[3/3] Configuration des permissions..." -ForegroundColor Yellow
ssh $SERVER "chmod -R 755 $REMOTE_PATH/html $REMOTE_PATH/js $REMOTE_PATH/css $REMOTE_PATH/lib $REMOTE_PATH/api"

# Resume
Write-Host "`n=== DEPLOIEMENT TERMINE ===" -ForegroundColor Green
Write-Host "`nAcces a l'interface admin :" -ForegroundColor Cyan
Write-Host "  Login : http://192.168.15.38/html/login.html" -ForegroundColor White
Write-Host "  Admin : http://192.168.15.38/html/Admin.html" -ForegroundColor White
Write-Host "`nIdentifiants : admin / admin" -ForegroundColor Yellow
Write-Host ""
