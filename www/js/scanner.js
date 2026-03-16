/**
 * Scanner QR Code - LycéePad
 * Utilise html5-qrcode pour scanner en temps réel
 * + appel API pour récupérer les données de la zone
 */

// ===== CONFIGURATION =====
const API_BASE_URL = "http://10.48.102.130:3000";

// ===== ÉTAT =====
let html5QrCode = null;
let scanning = false;
let useFrontCamera = false; // Par défaut: caméra arrière
let scannerInitialized = false;
let relayoutTimer = null;

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', function () {
    if (window.cordova) {
        document.addEventListener('deviceready', function () {
            initializeScanner();
            // Démarrage auto du scan sur mobile
            setTimeout(() => {
                if (typeof startScanning === 'function') startScanning();
            }, 400);
        }, { once: true });
    } else {
        initializeScanner();
        // Démarrage auto du scan sur navigateur
        setTimeout(() => {
            if (typeof startScanning === 'function') startScanning();
        }, 400);
    }
});

function initializeScanner() {
    if (scannerInitialized) return;
    scannerInitialized = true;

    const startBtn = document.getElementById('start-scan-btn');
    const closeBtn = document.getElementById('close-scanner-btn');
    const switchBtn = document.getElementById('switch-camera-btn');

    if (startBtn) startBtn.addEventListener('click', startScanning);
    if (closeBtn) closeBtn.addEventListener('click', closeScannerOverlay);
    if (switchBtn) switchBtn.addEventListener('click', switchCamera);
    window.addEventListener('resize', handleScannerRelayout);
    window.addEventListener('orientationchange', handleScannerRelayout);

    showStatus('Appuyez pour lancer le scan.', 'info');
}

function getScannerConfig() {
    return {
        fps: 15,
        qrbox: function (viewfinderWidth, viewfinderHeight) {
            const minSide = Math.min(viewfinderWidth, viewfinderHeight);
            const size = Math.max(180, Math.min(360, Math.floor(minSide * 0.62)));
            return { width: size, height: size };
        },
        disableFlip: false,
        experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
        }
    };
}

function handleScannerRelayout() {
    if (!scanning) return;
    clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(() => {
        restartScannerWithCurrentCamera();
    }, 220);
}

async function restartScannerWithCurrentCamera() {
    if (!scanning || !html5QrCode) return;

    try {
        await html5QrCode.stop();
        html5QrCode.clear();
    } catch (err) {
        console.warn('Erreur relayout scanner:', err);
    }

    try {
        html5QrCode = new Html5Qrcode("qr-reader-fullscreen");
        const facingMode = useFrontCamera ? "user" : "environment";
        await html5QrCode.start(
            { facingMode: facingMode },
            getScannerConfig(),
            onScanSuccess,
            onScanFailure
        );
    } catch (err) {
        console.error('Erreur redémarrage après rotation:', err);
        closeScannerOverlay();
        showStatus('❌ Erreur affichage caméra après rotation', 'error');
    }
}

// ===== DEMANDER PERMISSION CAMÉRA (Native Android) =====
function requestCameraPermission() {
    return new Promise((resolve) => {
        // Vérifier si le plugin est disponible
        if (window.cordova && cordova.plugins && cordova.plugins.permissions) {
            const permissions = cordova.plugins.permissions;
            
            permissions.checkPermission(permissions.CAMERA, function(status) {
                if (status.hasPermission) {
                    resolve(true);
                } else {
                    // Demander la permission
                    permissions.requestPermission(permissions.CAMERA, function(status) {
                        if (status.hasPermission) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    }, function() {
                        console.error('Erreur demande permission');
                        resolve(false);
                    });
                }
            }, function() {
                console.error('Erreur vérification permission');
                resolve(false);
            });
        } else {
            console.warn('Plugin permissions indisponible, fallback getUserMedia');
            // Fallback: essayer getUserMedia directement (navigateur web)
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    stream.getTracks().forEach(track => track.stop());
                    resolve(true);
                })
                .catch((err) => {
                    console.error('Fallback getUserMedia refusé:', err);
                    resolve(false);
                });
        }
    });
}

// ===== OUVRIR OVERLAY PLEIN ÉCRAN =====
function openScannerOverlay() {
    const overlay = document.getElementById('scanner-overlay');
    overlay.style.display = 'flex';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ===== FERMER OVERLAY =====
async function closeScannerOverlay() {
    if (html5QrCode && scanning) {
        try {
            await html5QrCode.stop();
            html5QrCode.clear();
        } catch (err) {
            console.warn('Erreur arrêt scanner:', err);
        }
        scanning = false;
    }

    const overlay = document.getElementById('scanner-overlay');
    overlay.classList.remove('active');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('scanner-instructions').style.display = '';
    showStatus('Scan annulé. Appuyez pour relancer.', 'info');
}

// ===== DÉMARRER LE SCAN =====
async function startScanning() {
    if (scanning) return;

    showStatus('Demande d\'accès à la caméra...', 'info');

    // 1) Demander la permission
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
        showStatus('❌ Permission caméra refusée. Autorisez l\'accès dans les paramètres.', 'error');
        return;
    }

    // 2) Ouvrir l'overlay plein écran
    openScannerOverlay();
    document.getElementById('scanner-instructions').style.display = 'none';
    document.getElementById('scan-result').style.display = 'none';

    scanning = true;

    try {
        html5QrCode = new Html5Qrcode("qr-reader-fullscreen");

        // Utiliser facingMode pour sélectionner la caméra
        const facingMode = useFrontCamera ? "user" : "environment";

        await html5QrCode.start(
            { facingMode: facingMode },
            getScannerConfig(),
            onScanSuccess,
            onScanFailure
        );


    } catch (err) {
        console.error('Erreur démarrage scanner:', err);
        closeScannerOverlay();
        showStatus('❌ Impossible d\'accéder à la caméra: ' + err, 'error');
    }
}

// ===== CHANGER DE CAMÉRA =====
async function switchCamera() {
    if (!scanning || !html5QrCode) return;

    try {
        await html5QrCode.stop();
        html5QrCode.clear();
    } catch (err) {
        console.warn('Erreur arrêt pour switch:', err);
    }

    useFrontCamera = !useFrontCamera;

    try {
        html5QrCode = new Html5Qrcode("qr-reader-fullscreen");
        const facingMode = useFrontCamera ? "user" : "environment";

        await html5QrCode.start(
            { facingMode: facingMode },
            getScannerConfig(),
            onScanSuccess,
            onScanFailure
        );

    } catch (err) {
        console.error('Erreur changement caméra:', err);
        closeScannerOverlay();
        showStatus('❌ Erreur changement de caméra', 'error');
    }
}

// ===== CALLBACK SCAN RÉUSSI =====
async function onScanSuccess(decodedText, decodedResult) {

    // Arrêter le scanner
    if (html5QrCode && scanning) {
        try {
            await html5QrCode.stop();
            html5QrCode.clear();
        } catch (e) {
            console.warn('Erreur arrêt après scan:', e);
        }
        scanning = false;
    }

    // Fermer l'overlay
    const overlay = document.getElementById('scanner-overlay');
    overlay.classList.remove('active');
    overlay.style.display = 'none';
    document.body.style.overflow = '';

    document.getElementById('scanner-instructions').style.display = 'none';

    showStatus('✅ QR Code détecté !', 'success');

    // Afficher le résultat + appel API
    showResultAndFetchAPI(decodedText);
}

// ===== CALLBACK SCAN ÉCHOUÉ (chaque frame sans QR) =====
function onScanFailure(error) {
    // Ignoré - c'est normal quand aucun QR n'est visible
}

// ===== AFFICHER RÉSULTAT + RÉCUPÉRER DEPUIS DB =====
async function showResultAndFetchAPI(qrCode) {
    const resultDiv = document.getElementById('scan-result');
    const apiLoader = document.getElementById('api-loader');
    const apiError = document.getElementById('api-error');
    const zoneData = document.getElementById('zone-data');

    // Reset
    apiLoader.style.display = 'flex';
    apiError.style.display = 'none';
    zoneData.style.display = 'none';
    resultDiv.style.display = 'block';
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    try {
        // Attendre que DBManager soit complètement initialisé
        await window.DBManager.ready;

        // Récupérer la zone via DBManager
        const zone = await window.DBManager.getZone(qrCode);
        
        if (!zone) {
            throw new Error('Ce QR Code n\'est associé à aucune zone du lycée.');
        }


        // Remplir les infos de la zone
        document.getElementById('zone-name').textContent = zone.nom || '—';
        document.getElementById('zone-building').textContent = zone.batiment || '—';
        document.getElementById('zone-floor').textContent = zone.etage || '—';
        
        // Formatter les coordonnées
        let coordText = '—';
        if (zone.coordonnees) {
            coordText = `${zone.coordonnees.lat}, ${zone.coordonnees.lng}`;
        }
        document.getElementById('zone-coordinates').textContent = coordText;

        const descEl = document.getElementById('zone-description');
        if (zone.description) {
            descEl.textContent = zone.description;
            descEl.style.display = 'block';
        } else {
            descEl.style.display = 'none';
        }

        const imgEl = document.getElementById('zone-image');
        if (zone.image) {
            imgEl.src = zone.image;
            imgEl.style.display = 'block';
        } else {
            imgEl.style.display = 'none';
        }

        apiLoader.style.display = 'none';
        zoneData.style.display = 'block';

        // Ajouter un bouton pour voir plus de détails
        const viewDetailsBtn = document.createElement('button');
        viewDetailsBtn.textContent = 'Voir plus de détails';
        viewDetailsBtn.className = 'btn-primary';
        viewDetailsBtn.style.marginTop = '20px';
        viewDetailsBtn.onclick = () => {
            window.location.href = `ZoneContent.html?qr=${encodeURIComponent(qrCode)}`;
        };
        
        // Ajouter le bouton s'il n'existe pas déjà
        if (!zoneData.querySelector('.btn-primary')) {
            zoneData.appendChild(viewDetailsBtn);
        }

    } catch (err) {
        console.error('Erreur récupération zone:', err);
        apiLoader.style.display = 'none';
        document.getElementById('api-error-text').textContent = err.message || 'Impossible de récupérer les données de la zone.';
        apiError.style.display = 'block';
    }
}

function showStatus(text, type) {
    const el = document.getElementById('scanner-status');
    if (!el) return;

    el.textContent = text;

    if (type === 'error') {
        el.style.color = '#ef4444';
    } else if (type === 'success') {
        el.style.color = '#22c55e';
    } else {
        el.style.color = '';
    }
}

// Bouton retour Android - fermer l'overlay
document.addEventListener('backbutton', function (e) {
    if (scanning) {
        e.preventDefault();
        closeScannerOverlay();
    }
}, false);

