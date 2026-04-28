# deploy-apk.ps1 - Build et déploie l'APK sur le serveur
# Usage: .\deploy-apk.ps1

$env:ANDROID_HOME = "C:\Users\nozap\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\cmdline-tools\latest\bin"

$APK    = "platforms\android\app\build\outputs\apk\debug\app-debug.apk"
$SERVER = "admin@192.168.15.38"
$DEST   = "/var/www/html/LyceePad/www/lyceepad.apk"
$VIDEO  = "www\video"
$VIDEOTMP = "www\_video_tmp"

# Écarter les vidéos du build pour réduire la taille de l'APK
if (Test-Path $VIDEO) { Rename-Item $VIDEO $VIDEOTMP }
$ASSETS_VIDEO = "platforms\android\app\src\main\assets\www\video"
if (Test-Path $ASSETS_VIDEO) { Remove-Item $ASSETS_VIDEO -Recurse -Force }

Write-Host "Build APK..." -ForegroundColor Cyan
cordova build android
$buildOk = $LASTEXITCODE

# Restaurer les vidéos dans tous les cas
if (Test-Path $VIDEOTMP) { Rename-Item $VIDEOTMP $VIDEO }

if ($buildOk -ne 0) { Write-Host "Build échoué." -ForegroundColor Red; exit 1 }

Write-Host "Upload sur le serveur..." -ForegroundColor Cyan
& "D:\applis\Git\usr\bin\scp.exe" $APK "${SERVER}:${DEST}"
if ($LASTEXITCODE -ne 0) { Write-Host "Upload échoué." -ForegroundColor Red; exit 1 }

Write-Host "APK disponible sur https://lycee-pad.cc/lyceepad.apk" -ForegroundColor Green
