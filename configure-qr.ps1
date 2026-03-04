# Script de configuration automatique des QR Codes - LyceePad
# Ce script configure automatiquement l'IP dans tous les fichiers necessaires

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Configuration QR Codes - LyceePad" -ForegroundColor Cyan
Write-Host "==================================================`n" -ForegroundColor Cyan

# ===== ETAPE 1 : Detecter l'IP =====
Write-Host "[*] Detection de votre adresse IP..." -ForegroundColor Yellow

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"
} | Select-Object -First 1).IPAddress

if (-not $ip) {
    Write-Host "[!] Impossible de detecter l'IP automatiquement." -ForegroundColor Red
    $ip = Read-Host "Entrez votre adresse IP manuellement (ex: 192.168.1.45)"
}

Write-Host "[OK] IP detectee: $ip`n" -ForegroundColor Green

# ===== ETAPE 2 : Demander confirmation =====
Write-Host "Cette IP sera configurée dans:" -ForegroundColor White
Write-Host "  • config.xml" -ForegroundColor Gray
Write-Host "  • www/html/scanner.html" -ForegroundColor Gray
Write-Host "  • www/js/scanner.js`n" -ForegroundColor Gray

$confirm = Read-Host "Continuer avec cette IP? (O/n)"
if ($confirm -eq "n" -or $confirm -eq "N") {
    Write-Host "[X] Operation annulee.`n" -ForegroundColor Red
    exit
}

# ===== ETAPE 3 : Sauvegarder les fichiers originaux =====
Write-Host "`n[*] Sauvegarde des fichiers originaux..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backup_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Copy-Item "config.xml" "$backupDir\config.xml" -Force
Copy-Item "www\html\scanner.html" "$backupDir\scanner.html" -Force
Copy-Item "www\js\scanner.js" "$backupDir\scanner.js" -Force

Write-Host "[OK] Sauvegarde creee dans: $backupDir`n" -ForegroundColor Green

# ===== ETAPE 4 : Modifier les fichiers =====
Write-Host "[*] Modification des fichiers..." -ForegroundColor Yellow

# Fichier 1: config.xml
$configContent = Get-Content "config.xml" -Raw
$configContent = $configContent -replace 'http://[0-9\.]+:', "http://$($ip):"
Set-Content "config.xml" -Value $configContent -NoNewline
Write-Host "  [OK] config.xml modifie" -ForegroundColor Green

# Fichier 2: scanner.html
$scannerHtmlContent = Get-Content "www\html\scanner.html" -Raw
$scannerHtmlContent = $scannerHtmlContent -replace 'http://[0-9\.]+:', "http://$($ip):"
Set-Content "www\html\scanner.html" -Value $scannerHtmlContent -NoNewline
Write-Host "  [OK] scanner.html modifie" -ForegroundColor Green

# Fichier 3: scanner.js
$scannerJsContent = Get-Content "www\js\scanner.js" -Raw
$scannerJsContent = $scannerJsContent -replace 'const API_BASE_URL = "http://[^"]+";', "const API_BASE_URL = `"http://$($ip):3000`";"
Set-Content "www\js\scanner.js" -Value $scannerJsContent -NoNewline
Write-Host "  [OK] scanner.js modifie`n" -ForegroundColor Green

# ===== ETAPE 5 : Instructions pour le serveur =====
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Prochaines etapes" -ForegroundColor Cyan
Write-Host "==================================================`n" -ForegroundColor Cyan

Write-Host "1. Creer le serveur backend:" -ForegroundColor Yellow
Write-Host "   mkdir LyceePad-Backend" -ForegroundColor Gray
Write-Host "   cd LyceePad-Backend" -ForegroundColor Gray
Write-Host "   Copy-Item ..\server-package.json package.json" -ForegroundColor Gray
Write-Host "   Copy-Item ..\server-example.js server.js" -ForegroundColor Gray
Write-Host "   npm install`n" -ForegroundColor Gray

Write-Host "2. Demarrer le serveur:" -ForegroundColor Yellow
Write-Host "   npm start`n" -ForegroundColor Gray

Write-Host "3. Recompiler l'application:" -ForegroundColor Yellow
Write-Host "   `$env:ANDROID_HOME = `"C:\Users\$env:USERNAME\AppData\Local\Android\Sdk`"" -ForegroundColor Gray
Write-Host "   cordova build android`n" -ForegroundColor Gray

Write-Host "4. Tester l'API depuis un navigateur:" -ForegroundColor Yellow
Write-Host "   http://$($ip):3000/api/test`n" -ForegroundColor Gray

Write-Host "Pour plus de details, voir: GUIDE_QR_CODES.md`n" -ForegroundColor Cyan

Write-Host "[OK] Configuration terminee !`n" -ForegroundColor Green
